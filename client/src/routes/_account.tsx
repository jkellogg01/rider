import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_account")({
	component: AccountPage,
});

function AccountPage() {
	// TODO: make a real page here
	return (
		< div className="min-h-dvh flex flex-col" >
			{/* HACK: don't like that I need flex for this but h-full doesn't seem to work right */}
			<div className="container mx-auto p-2">
				<Link to="/" className="block font-bold text-xl">Rider</Link>
			</div>
			<hr />
			<div className="h-full flex-grow content-center">
				<Outlet />
			</div>
		</div >
	);
}
