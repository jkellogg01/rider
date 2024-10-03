import { Field } from "@/components/FormField";
import { BrandMark, Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	Outlet,
	useRouter,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient
			.ensureQueryData({
				queryKey: ["current-user"],
				queryFn: getCurrentUser,
			})
			.catch(() => {
				return null;
			});
		return { user };
	},
	component: App,
});

function App() {
	const context = Route.useRouteContext();
	if (!context.user) {
		return <Navigate to="/login" />;
	}

	return (
		<>
			<Header>
				<div className="flex flex-row gap-4 items-end">
					<BrandMark />
					<BandSelection />
				</div>
			</Header>
			<div className="mx-auto container">
				<Outlet />
			</div>
		</>
	);
}

function BandSelection() {
	const ctx = Route.useRouteContext();
	const { data } = useQuery({
		queryKey: ["current-user-bands"],
		queryFn: async () => {
			const res = await fetch("/api/bands");
			if (!res.ok) {
				throw new Error("failed to fetch user bands");
			}
			const data = await res.json();
			const schema = z.object({
				id: z.number().int(),
				name: z.string(),
				created_at: z.string().datetime(),
				updated_at: z.string().datetime(),
			});
			return (
				schema.array().nullable().parse(data) ??
				new Array<typeof schema._type>()
			);
		},
	});

	const bandSelectionSchema = z.object({
		bandName: z.string().optional(),
		joinCode: z.string().optional(),
	});

	const router = useRouter();
	const form = useForm({
		defaultValues: {
			bandName: "",
			joinCode: "",
		},
		validatorAdapter: zodValidator(),
		validators: {
			onChange: bandSelectionSchema.refine(
				(state) => !state.bandName != !state.joinCode,
				{
					message: "please enter either a band name or a join code, not both.",
				},
			),
		},
		onSubmit: ({ value }) => {
			if (!value.bandName == !value.joinCode) {
				throw new Error(
					"form values should include exactly one of either a band name or a join code.",
				);
			}
			if (value.bandName) {
				createBand(value.bandName).then((data) => {
					console.log(data);
					ctx.queryClient.invalidateQueries({
						queryKey: ["current-user-bands"],
					});
					router.navigate({
						to: "/dashboard",
						search: { band: data.id },
					});
				});
			} else {
				// TODO: join band
			}
		},
	});

	if (data && data.length > 0) {
		return <div>hello yes I am a multi select</div>;
	}

	return (
		<Dialog defaultOpen>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus className="pr-2" />
					Create a new band...
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Rider's not much use without a band!</DialogTitle>
					<DialogDescription>
						Create or join a band in order to get started.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field
						name="bandName"
						validators={{
							onChange: bandSelectionSchema.shape.bandName,
						}}
						children={(field) => (
							<Field
								name={field.name}
								value={field.state.value}
								label="Band Name"
								errors={field.state.meta.errors.join(", ")}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						)}
					/>
					<div className="relative py-2">
						<div className="absolute inset-0 flex items-center">
							<Separator orientation="horizontal" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								or
							</span>
						</div>
					</div>
					<form.Field
						name="joinCode"
						validators={{
							onChange: bandSelectionSchema.shape.joinCode,
						}}
						children={(field) => (
							<Field
								name={field.name}
								value={field.state.value}
								label="Join Code"
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => state}
						children={({ canSubmit, isSubmitting, values, errors }) => {
							if (isSubmitting)
								return (
									<Button type="submit" disabled className="mt-2">
										<Loader2 className="mr-2 size-4 animate-spin" />
										Please wait...
									</Button>
								);

							const errorText = errors.join(", ");

							if (errorText) {
								return (
									<div>
										<div className="text-sm text-muted-foreground mt-2">
											{errorText}
										</div>
										<Button
											disabled={!canSubmit}
											type="submit"
											className="mt-2"
										>
											Submit
										</Button>
									</div>
								);
							}

							return (
								<Button disabled={!canSubmit} type="submit" className="mt-2">
									{values.joinCode ? "Join Band" : "Create Band"}
								</Button>
							);
						}}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

async function createBand(name: string) {
	const res = await fetch("/api/bands", {
		method: "POST",
		body: JSON.stringify({ name }),
	});
	if (!res.ok) {
		throw new Error("failed to create new band");
	}
	const data = await res.json();
	return z
		.object({
			id: z.number(),
			name: z.string(),
			created_at: z.string().datetime(),
			updated_at: z.string().datetime(),
			user_is_admin: z.boolean(),
		})
		.parse(data);
}
