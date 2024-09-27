import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function deleteCookies(...names: Array<string>) {
	names.forEach((name) => {
		document.cookie = `${name}=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
	});
}

function Index() {
	const queryClient = useQueryClient();
	const { data, error, isPending } = useQuery({
		retry: 0,
		queryKey: ["current-user"],
		// FIXME: this request shouldn't refetch for 15 minutes,
		// but it refetches on all page loads
		staleTime: 1000 * 60 * 15,
		queryFn: async () => {
			const res = await fetch("/api/me");
			if (!res.ok) {
				throw new Error(
					`${res.status} ${res.statusText}: something went wrong while fetching the current user`,
				);
			}
			return await res.json();
		},
	});

	if (error || isPending || !data)
		return (
			<>
				<Header>
					<Button size="sm" asChild>
						<Link to="/login">Log In</Link>
					</Button>
					<Button size="sm" asChild variant="secondary">
						<Link to="/register">Sign Up</Link>
					</Button>
				</Header>
			</>
		);

	return (
		<Header>
			<Button size="sm" asChild>
				<Link to="/">Hello, {data.givenName}!</Link>
			</Button>
			<Button
				size="sm"
				variant="outline"
				onClick={() => {
					deleteCookies("rider-access", "rider-refresh");
					queryClient.invalidateQueries({ queryKey: ["current-user"] });
				}}
			>
				Log Out
			</Button>
		</Header>
	);
}
