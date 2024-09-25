import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: AccountPage,
});

function AccountPage() {
	// TODO: make a real page here
	return (
		<div className="m-auto">
			<Outlet />
		</div>
	);
}
