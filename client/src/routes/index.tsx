import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
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
}
