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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_account/login")({
	component: LoginForm,
});

function LoginForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const loginMutation = useMutation({
		mutationFn: async (data: Object) => {
			const res = await fetch("/api/login", {
				method: "POST",
				body: JSON.stringify(data),
			});
			if (!res.ok) {
				throw new Error("something went wrong while logging the user in");
			}
			return await res.json();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["current-user"] });
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await loginMutation.mutateAsync(value);
			// TODO: navigate to app index once it exists
			router.navigate({ to: "/" });
		},
	});

	return (
		<Card className="max-w-sm mx-auto">
			<CardHeader>
				<CardTitle>Log In</CardTitle>
				{/* TODO: write good copy */}
				<CardDescription>
					You'll need to sign in in order to take advantage of our services
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
						name="email"
						validatorAdapter={zodValidator()}
						validators={{
							onBlur: z.string().email("please enter a valid email address"),
						}}
						children={(field) => (
							<Field
								name={field.name}
								type="email"
								label="Email"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								onBlur={field.handleBlur}
								errors={field.state.meta.errors.join(", ")}
							/>
						)}
					/>
					<form.Field
						name="password"
						children={(field) => (
							<Field
								name={field.name}
								type="password"
								label="Password"
								value={field.state.value}
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
									Log In
								</Button>
							);
						}}
					/>
				</form>
			</CardContent>
			<CardFooter>
				<p className="text-sm leading-none">
					Don't have an account?{" "}
					<Link to="/register" className="underline">
						Sign Up
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
