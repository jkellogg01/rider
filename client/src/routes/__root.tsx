import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createRootRoute({
	component: Root,
});

// only import & use dev tools in production
const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: React.lazy(() =>
				import("@tanstack/router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			);

function Root() {
	return (
		<>
			<Header />
			<div className="container mx-auto">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</>
	);
}

function Header() {
	return (
		<header>
			<div className="container mx-auto p-2 flex justify-between items-baseline gap-2">
				<Link to="/" className="font-bold text-xl [&.active]:cursor-default">
					Rider
				</Link>
				<div className="flex gap-2">
					<RegisterDialog />
					<LoginDialog />
				</div>
			</div>
			<hr />
		</header>
	);
}

function LoginDialog() {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const res = await fetch("/api/login", {
				method: "POST",
				body: JSON.stringify(value),
			});
			if (!res.ok) {
				console.log(`${res.status} ${res.statusText}`);
			}
			const data = await res.json();
			console.log(data);

			// TODO: redirect to the app entrypoint once it exists
		},
	});

	return (
		<Dialog onOpenChange={form.reset}>
			<DialogTrigger asChild>
				<Button>Log In</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Log In</DialogTitle>
					<DialogDescription>Use your existing Rider account</DialogDescription>
				</DialogHeader>
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
							onChangeAsync: z.string().email("must be a valid email address"),
							onChangeAsyncDebounceMs: 500,
						}}
						children={(field) => (
							<FormField field={field} label="Email" type="email" />
						)}
					/>
					<form.Field
						name="password"
						validatorAdapter={zodValidator()}
						validators={{
							onChange: z
								.string()
								.min(6, { message: "this password is too short!" }),
						}}
						children={(field) => (
							<FormField field={field} label="Password" type="password" />
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button disabled={!canSubmit || isSubmitting} className="mt-4">
								{isSubmitting ? "Please Wait..." : "Submit"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function RegisterDialog() {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			console.log(value);
		},
	});

	return (
		<Dialog onOpenChange={form.reset}>
			<DialogTrigger asChild>
				<Button variant="secondary">Register</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Register</DialogTitle>
					<DialogDescription>
						Get started with a new Rider account
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
						name="email"
						validatorAdapter={zodValidator()}
						validators={{
							onChangeAsync: z.string().email("must be a valid email address"),
							onChangeAsyncDebounceMs: 500,
						}}
						children={(field) => (
							<FormField field={field} label="Email" type="email" />
						)}
					/>
					<form.Field
						name="password"
						validatorAdapter={zodValidator()}
						validators={{
							onChange: z
								.string()
								.min(6, { message: "this password is too short!" }),
						}}
						children={(field) => (
							<FormField field={field} label="Password" type="password" />
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button disabled={!canSubmit || isSubmitting} className="mt-4">
								{isSubmitting ? "Please Wait..." : "Submit"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function FormField({
	field,
	label,
	type,
}: { field: any; label: string; type?: React.HTMLInputTypeAttribute }) {
	return (
		<div>
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				type={type || "text"}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
			/>
			{field.state.meta.errors ? (
				<p role="alert" className="text-sm text-destructive mt-2">
					{field.state.meta.errors.join(", ")}
				</p>
			) : null}
		</div>
	);
}
