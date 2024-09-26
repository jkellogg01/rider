import Header from "@/components/Header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: AccountPage,
});

function AccountPage() {
	// TODO: make a real page here
	return (
		<div className="h-dvh overflow-hidden">
			<Header />
			<div className="min-h-[50%] mt-16 content-end px-2">
				<Outlet />
			</div>
		</div>
	);
}
