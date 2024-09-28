import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Field } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserSchema } from "@/lib/api";

export const Route = createFileRoute("/_account/register")({
	component: RegisterForm,
});

function RegisterForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const registerMutation = useMutation({
		mutationFn: async (data: Object) => {
			const res = await fetch("/api/users", {
				method: "POST",
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				throw new Error("something went wrong while registering the user");
			}
			return await res.json();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["current-user"] });
		},
	});

	const form = useForm({
		defaultValues: {
			givenName: "",
			familyName: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await registerMutation.mutateAsync(value);
			// TODO: navigate to app index once it exists
			router.navigate({ to: "/" });
		},
		validatorAdapter: zodValidator(),
	});

	return (
		<Card className="max-w-sm mx-auto">
			<CardHeader>
				<CardTitle>Register</CardTitle>
				<CardDescription>
					Create a new account in order to get started with Rider
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
					<div className="flex flex-row gap-2">
						<form.Field
							name="givenName"
							validators={{
								onBlur: createUserSchema.pick({ givenName: true }),
							}}
							children={(field) => (
								<Field
									name={field.name}
									type="text"
									label="Given Name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									errors={field.state.meta.errors.join(", ")}
								/>
							)}
						/>
						<form.Field
							name="familyName"
							validators={{
								onBlur: createUserSchema.pick({ familyName: true }),
							}}
							children={(field) => (
								<Field
									name={field.name}
									type="text"
									label="Family Name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									errors={field.state.meta.errors.join(", ")}
								/>
							)}
						/>
					</div>
					<form.Field
						name="email"
						validators={{
							onBlur: createUserSchema.pick({ email: true }),
						}}
						children={(field) => (
							<Field
								name={field.name}
								type="email"
								label="Email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								errors={field.state.meta.errors.join(", ")}
							/>
						)}
					/>
					<form.Field
						name="password"
						validators={{
							onBlur: createUserSchema.pick({ password: true }),
						}}
						children={(field) => (
							<Field
								name={field.name}
								type="password"
								label="Password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								errors={field.state.meta.errors.join(", ")}
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => {
							if (isSubmitting)
								return (
									<Button type="submit" disabled className="mt-2 w-full">
										<Loader2 className="mr-2 size-4 animate-spin" />
										Please wait...
									</Button>
								);

							return (
								<Button
									disabled={!canSubmit}
									type="submit"
									className="mt-2 w-full"
								>
									Sign Up
								</Button>
							);
						}}
					/>
				</form>
			</CardContent>
			<CardFooter>
				<p className="text-sm leading-none">
					Already working with us?{" "}
					<Link to="/login" className="underline">
						Log In
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
