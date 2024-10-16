import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const fakeMessages: Array<{ name: string; body: string; email: string }> = [
  {
    name: "Joe Testman",
    email: "joe@the-testmen.com",
    body: "Hey man, just reaching out to see if you'd be interested in opening for us this October. I know it's a pretty tight turnaround but I would really appreciate it!",
  },
  {
    name: "Tomas D'example",
    email: "thomas@nonemptyspace.net",
    body: "This is just going to be a really really long message, the entire point of this message is to make the text wrap for at least three lines. What I really want more than anything is for the font to wrap for three lines so that I can see what it looks like when there's a really long and substantive message in my inbox",
  },
];

function Dashboard() {
  const { band: bandID } = Route.useSearch();
  const {
    data: band,
    error,
    isPending,
  } = useQuery({
    queryKey: ["band", bandID],
    queryFn: async () => {
      if (!bandID) {
        throw new Error("no band id");
      }
      const res = await fetch(`/api/bands/${bandID}`);
      if (!res.ok) {
        switch (res.status) {
          case 404:
            return undefined;
          default:
            throw new Error("failed to fetch band");
        }
      }
      const data = await res.json();
      const result = z
        .object({
          id: z.number().int().min(1),
          name: z.string(),
          created_at: z.string().datetime(),
          updated_at: z.string().datetime(),
        })
        .parse(data);
      console.log({ data, result });
      return result;
    },
  });

  if (!bandID || error || isPending || !band) {
    return (
      <div className="text-center min-h-96 content-center">
        Nothing to do...
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Invite bandID={bandID} />
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Messages</CardTitle>
              <CardDescription>Who's been reaching out to you?</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link to=".">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeMessages.map(({ name, email, body }) => (
                  <TableRow key={name + email}>
                    <TableCell className="align-top">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-muted-foreground">
                        {email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-prose align-top">
                      {preview(body, 250)}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {/* truly i cannot put into words how much i hate that this is the
          idiomatic way to handle using routing to show a modal */}
      <Outlet />
      <div>This is below the Outlet</div>
    </main>
  );
}

function preview(body: string, length: number = 65) {
  if (body.length < length) {
    return body;
  }

  const words = body.split(" ");
  let idx = 0;
  let sum = 0;
  while (true) {
    sum += words[idx].length;
    if (sum > length - 3) {
      break;
    }
    sum++; // compensates for a space
    idx++;
  }
  return words.slice(0, idx).join(" ").concat("...");
}

function Invite({ bandID }: { bandID: number }) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      expire: new Date().toJSON(),
      make_admin: false,
    },
    validatorAdapter: zodValidator(),
    onSubmit: () => {
      router.navigate({
        to: "/dashboard/invitation",
        search: {
          band: bandID,
          ...form.state.values,
        },
      });
    },
  });

  const options = [
    {
      label: "30 Minutes",
      minutes: 30,
    },
    {
      label: "1 Hour",
      minutes: 60,
    },
    {
      label: "6 Hours",
      minutes: 60 * 6,
    },
    {
      label: "12 Hours",
      minutes: 60 * 12,
    },
    {
      label: "1 Day",
      minutes: 60 * 24,
    },
    {
      label: "7 Days",
      minutes: 60 * 24 * 7,
    },
    {
      label: "30 Days",
      minutes: 60 * 24 * 30,
    },
  ];

  const ONE_MINUTE = 1000 * 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Members</CardTitle>
        <CardDescription>
          Generate a code to invite new members to your band
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="expire"
            validators={{
              onChange: z.string().datetime(),
            }}
            children={(field) => (
              <>
                <Label>Expire After:</Label>
                <Select
                  name={field.name}
                  onValueChange={(value) => {
                    field.handleChange(
                      new Date(
                        Number(value) * ONE_MINUTE + Date.now(),
                      ).toJSON(),
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="select a duration..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectContent>
                      <SelectGroup>
                        {options.map(({ label, minutes }) => (
                          <SelectItem key={minutes} value={minutes.toString()}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm text-muted-foreground">
                  {field.state.meta.errors.join(", ")}
                </p>
              </>
            )}
          />
          <form.Field
            name="make_admin"
            children={(field) => (
              <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={(x) => {
                    let value: boolean = Boolean(x.valueOf());
                    field.handleChange(value);
                  }}
                />
                <div>
                  <Label htmlFor={field.name}>
                    Make this user an administrator
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    This user will be granted complete control over information
                    about the band.
                  </p>
                </div>
              </div>
            )}
          />
          <form.Subscribe
            selector={(state) => state}
            children={({ canSubmit, isSubmitting }) => {
              if (isSubmitting) {
                return (
                  <Button type="submit" disabled className="mt-2">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Please wait...
                  </Button>
                );
              }

              return (
                <Button type="submit" disabled={!canSubmit} className="mt-2">
                  Generate a Code
                </Button>
              );
            }}
          />
        </form>
      </CardContent>
    </Card>
  );
}
