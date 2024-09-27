import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: () => {
		const { status } = useQuery({
			retry: 0,
			queryKey: ["current-user"],
			queryFn: async () => {
				const res = await fetch("/api/me");
				if (!res.ok) {
					throw new Error("could not fetch the current user");
				}
				return await res.json();
			},
		});

		if (status === "success") return <Navigate to="/" />;

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
