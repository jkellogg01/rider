import { Header, BrandMark } from "@/components/Header";
import { getCurrentUser } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: AccountPage,
});

function AccountPage() {
	const result = useQuery({
		queryKey: ["current-user"],
		queryFn: getCurrentUser,
	});
	if (result.data && !result.isStale) {
		return <Navigate to="/app" />;
	}

	// TODO: make a real page here
	return (
		<div className="h-dvh flex flex-col">
			<Header>
				<BrandMark />
				<div />
			</Header>
			<div className="h-full content-center px-2">
				<Outlet />
			</div>
		</div>
	);
}
