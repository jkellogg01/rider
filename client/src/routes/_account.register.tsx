import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_account/register")({
	component: RegisterForm,
});

function RegisterForm() {
	// TODO: needs validation
	const form = useForm({
		defaultValues: {
			givenName: "",
			familyName: "",
			email: "",
			password: "",
		},
	});

	return (
		<Card className="max-w-sm mx-auto">
			<CardHeader>
				<CardTitle>Register</CardTitle>
				{/* TODO: write good copy */}
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
							children={(field) => (
								<Field
									name={field.name}
									type="text"
									label="Given Name"
									errors={field.state.meta.errors.join(", ")}
								/>
							)}
						/>
						<form.Field
							name="familyName"
							children={(field) => (
								<Field
									name={field.name}
									type="text"
									label="Family Name"
									errors={field.state.meta.errors.join(", ")}
								/>
							)}
						/>
					</div>
					<form.Field
						name="email"
						children={(field) => (
							<Field
								name={field.name}
								type="email"
								label="Email"
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
