import { Field } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_account/login")({
	component: LoginForm,
});

function LoginForm() {
	// TODO: needs validation
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<Card className="max-w-sm m-auto">
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
						children={(field) => (
							<Field
								name={field.name}
								type="email"
								label="Email"
								errors={field.state.meta.errors}
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
								errors={field.state.meta.errors}
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => {
							if (isSubmitting)
								return (
									<Button type="submit" disabled className="mt-2">
										<Loader2 className="mr-2 size-4 animate-spin" />
										Please wait...
									</Button>
								);

							return (
								<Button disabled={!canSubmit} type="submit" className="mt-2">
									Log In
								</Button>
							);
						}}
					/>
				</form>
			</CardContent>
		</Card>
	);
}
