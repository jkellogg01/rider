import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";

const invitationSearchSchema = z.object({
  band: z.number().int(),
  expire: z
    .string()
    .datetime()
    .refine(
      (dt) => Date.parse(dt) > Date.now(),
      "expiration date cannot be less than or equal to the current date",
    ),
  make_admin: z.boolean().catch(false),
});

const invitationResponseSchema = z.object({
  id: z.number().int(),
  body: z.string(),
  creator_id: z.number().int(),
  band_id: z.number().int(),
  keep: z.boolean(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
});

export const Route = createFileRoute("/_app/dashboard/invitation")({
  validateSearch: zodSearchValidator(invitationSearchSchema),
  errorComponent: () => <Navigate to="/dashboard" search={{ band: null }} />,
  component: Component,
  beforeLoad: async ({ context, search }) => {
    const queryClient = context.queryClient;
    const data = await queryClient.ensureQueryData({
      queryKey: ["invitation", search],
      staleTime: 1000 * 15 * 60,
      queryFn: async () => {
        const expire = Date.parse(search.expire);
        const res = await fetch(
          `/api/bands/join/${search.band}?make_admin=${search.make_admin}&expire=${expire}`,
        );
        if (!res.ok) {
          res
            .json()
            .then((data) => {
              console.error(data);
              throw new Error(data["message"]);
            })
            .catch((err) => {
              console.error(err);
              throw new Error("failed to fetch invitation");
            });
        }
        const data = await res.json();
        return invitationResponseSchema.parse(data);
      },
    });
    return { invitation: data };
  },
});

function Component() {
  const context = Route.useRouteContext();
  const router = useRouter();
  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          router.navigate({
            to: "/dashboard",
            search: { band: context.invitation.band_id },
          });
        }
      }}
    >
      <DialogContent
        onClick={() => {
          // if the user clicks anywhere inside of the dialog, hit the 'save' endpoint on the server
          fetch(`/api/bands/join/${context.invitation.id}`, {
            method: "POST",
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("failed to save invitation");
              }
              return res.json();
            })
            .then((data) => {
              console.debug(data);
            })
            .catch((err) => {
              console.error(err);
              throw new Error("failed to save invitation");
            });
        }}
      >
        <DialogHeader>
          <DialogTitle>Invitation code</DialogTitle>
          <DialogDescription>
            Click the 'copy' button to copy this code to your clipboard and
            preserve your invitation code!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-2">
          <Input readOnly value={context.invitation.body} />
          <Button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(context.invitation.body);
            }}
          >
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
