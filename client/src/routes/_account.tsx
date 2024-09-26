import Header from "@/components/Header";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	beforeLoad: async ({ context }) => {
		console.debug("before load");
		const queryClient = context.queryClient;
		try {
			const user = await queryClient.ensureQueryData({
				queryKey: ["current-user"],
				queryFn: async () => {
					const res = await fetch("/api/me");
					if (!res.ok) {
						throw new Error(
							`${res.status} ${res.statusText}: something went wrong while fetching the current user`,
						);
					}
					return await res.json();
				},
				staleTime: 1000 * 60 * 15,
			});
			return { user };
		} catch (err) {
			console.error(err);
			return { user: null };
		}
	},
	component: () => {
		const { user } = Route.useRouteContext();
		if (user) return <Navigate to="/" />;
		return <AccountPage />;
	},
});

function AccountPage() {
	// TODO: make a real page here
	return (
		<div className="h-dvh flex flex-col">
			<Header />
			<div className="h-full content-center px-2">
				<Outlet />
			</div>
		</div>
	);
}
