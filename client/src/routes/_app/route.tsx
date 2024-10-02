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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient
			.ensureQueryData({
				queryKey: ["current-user"],
				queryFn: getCurrentUser,
			})
			.catch(() => Route.router!.navigate({ to: "/login" }));
		return { user };
	},
	component: App,
});

function App() {
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
	const { data, error, isPending } = useQuery({
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
				createdAt: z.date(),
				updatedAt: z.date(),
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

	const form = useForm({
		defaultValues: {
			bandName: "",
			joinCode: "",
		},
		validatorAdapter: zodValidator(),
		validators: {
			onChange: bandSelectionSchema.refine(
				(state) => {
					return (
						(state.bandName && !state.joinCode) ||
						(state.joinCode && !state.bandName)
					);
				},
				{
					message: "please enter either a band name or a join code, not both.",
				},
			),
		},
		onSubmit: () => console.error("TODO: make this form do something"),
	});

	if (error || (!isPending && data.length === 0)) {
		return (
			<Dialog defaultOpen>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						<Plus /> Create a new band...
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

								return (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Button
													disabled={!canSubmit}
													type="submit"
													className="mt-2"
												>
													{canSubmit
														? values.joinCode
															? "Join Band"
															: "Create Band"
														: "Submit"}
												</Button>
											</TooltipTrigger>
											<TooltipContent>{errors.join(", ")}</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								);
							}}
						/>
					</form>
				</DialogContent>
			</Dialog>
		);
	}

	return <div>hello yes i am multi select</div>;
}
