import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const res = await fetch("/api/me");
		if (!res.ok) {
			return { user: null };
		}
		const data = await res.json();
		if (!data) {
			return { user: null };
		}
		return {
			user: {
				id: data.id,
				email: data.email,
			},
		};
	},
	component: () => {
		const { user } = Route.useRouteContext();
		if (!user) {
			return <Login />;
		}

		return <Outlet />;
	},
});

// TODO: make this work as a modal instead of a full page
// also make it not ugly as shit
function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<div className="mt-8 p-4 border-zinc-800 dark:border-white border-2 rounded-lg max-w-prose m-auto">
			<form
				className="flex flex-col gap-2"
				onSubmit={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					const res = await fetch("/api/login", {
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
					});
					if (!res.ok) {
						console.error(res.statusText);
						return;
					}
					const data = await res.json();
					if (!data.id || !data.email) {
						console.error(data);
						return;
					}
					router.invalidate();
				}}
			>
				<label htmlFor="email">email</label>
				<input
					className="bg-zinc-200 dark:bg-zinc-800 rounded"
					type="email"
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label htmlFor="password">password</label>
				<input
					className="bg-zinc-200 dark:bg-zinc-800 rounded"
					type="password"
					name="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Log In</button>
			</form>
		</div>
	);
}
