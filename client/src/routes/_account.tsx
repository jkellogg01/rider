import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/api";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	beforeLoad: async ({ context }) => {
		const queryClient = context.queryClient;
		const user = await queryClient
			.fetchQuery({
				queryKey: ["current-user"],
				queryFn: getCurrentUser,
			})
			.catch(() => {
				return { user: null };
			});
		return { user };
	},
	component: () => {
		const context = Route.useRouteContext();
		if (context.user) {
			// TODO: this should navigate to the app entry point once it exists
			return <Navigate to="/" />;
		}
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
