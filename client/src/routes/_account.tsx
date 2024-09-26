import Header from "@/components/Header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: AccountPage,
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
