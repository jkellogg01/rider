import { BrandMark, Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
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
				<BrandMark />
			</Header>
			<div className="mx-auto container">
				<Outlet />
			</div>
		</>
	);
}
