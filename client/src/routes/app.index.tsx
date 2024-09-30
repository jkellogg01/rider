import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/")({
	component: AppIndex,
});

const fakeMessages: Array<{ name: string; body: string; email: string }> = [
	{
		name: "Joe Testman",
		email: "joe@the-testmen.com",
		body: "Hey man, just reaching out to see if you'd be interested in opening for us this October. I know it's a pretty tight turnaround but I would really appreciate it!",
	},
	{
		name: "Thomas D'example",
		email: "thomas@notemptyspace.net",
		body: "Your set was sick last night! Thanks for letting me borrow your amp. I think we could do pretty well if we went on tour together.",
	},
];

function AppIndex() {
	return (
		<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						There aren't any actions yet.
					</CardContent>
				</Card>
				<Card className="xl:col-span-2">
					<CardHeader className="flex flex-row items-center">
						<div className="grid gap-2">
							<CardTitle>Messages</CardTitle>
							<CardDescription>Who's been reaching out to you?</CardDescription>
						</div>
						<Button asChild size="sm" className="ml-auto gap-1">
							<Link to=".">View All</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Preview</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{fakeMessages.map(({ name, email, body }) => (
									<TableRow>
										<TableCell>
											<div className="font-medium">{name}</div>
											<div className="text-sm text-muted-foreground">
												{email}
											</div>
										</TableCell>
										<TableCell>{preview(body)}</TableCell>
										<TableCell>
											<Button variant="outline" size="sm">
												View
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

function preview(body: string) {
	if (body.length < 65) {
		return body;
	}

	const words = body.split(" ");
	let idx = 0;
	let sum = 0;
	while (true) {
		sum += words[idx].length;
		if (sum > 62) {
			break;
		}
		// compensate for the space
		sum++;
		idx++;
	}
	return words.slice(0, idx).join(" ").concat("...");
}
