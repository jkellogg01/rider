import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
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
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/dashboard")({
	component: Dashboard,
	validateSearch: (search) =>
		z
			.object({
				band: z.number().int().nullable(),
			})
			.parse(search),
});

const fakeMessages: Array<{ name: string; body: string; email: string }> = [
	{
		name: "Joe Testman",
		email: "joe@the-testmen.com",
		body: "Hey man, just reaching out to see if you'd be interested in opening for us this October. I know it's a pretty tight turnaround but I would really appreciate it!",
	},
	{
		name: "Tomas D'example",
		email: "thomas@nonemptyspace.net",
		body: "This is just going to be a really really long message, the entire point of this message is to make the text wrap for at least three lines. What I really want more than anything is for the font to wrap for three lines so that I can see what it looks like when there's a really long and substantive message in my inbox",
	},
];

async function sendInvite(id: number) {
	const res = await fetch(`/api/bands/join/${id}`);
	if (!res.ok) {
		throw new Error("failed to fetch invitation");
	}
	const data = await res.json();
	const schema = z.object({
		id: z.number().int(),
		body: z.string().length(10),
		creator_id: z.number().int(),
		band_id: z.number().int(),
		created_at: z.string().datetime(),
		expiresAt: z.string().datetime(),
	});
	return schema.parse(data);
}

function Dashboard() {
	const { band: bandID } = Route.useSearch();
	const {
		data: band,
		error,
		isPending,
	} = useQuery({
		queryKey: ["band", bandID],
		queryFn: async () => {
			if (!bandID) {
				throw new Error("no band id");
			}
			const res = await fetch(`/api/bands/${bandID}`);
			if (!res.ok) {
				switch (res.status) {
					case 404:
						return undefined;
					default:
						throw new Error("failed to fetch band");
				}
			}
			const data = await res.json();
			const result = z
				.object({
					id: z.number().int().min(1),
					name: z.string(),
					created_at: z.string().datetime(),
					updated_at: z.string().datetime(),
				})
				.parse(data);
			console.log({ data, result });
			return result;
		},
	});

	if (error || isPending || !band) {
		return (
			<div className="text-center min-h-96 content-center">
				Nothing to do...
			</div>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						<Button
							onClick={async () => {
								const invite = await sendInvite(band.id);
								console.log(invite);
							}}
						>
							Invite members...
						</Button>
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
									<TableRow key={name + email}>
										<TableCell className="align-top">
											<div className="font-medium">{name}</div>
											<div className="text-sm text-muted-foreground">
												{email}
											</div>
										</TableCell>
										<TableCell className="max-w-prose align-top">
											{preview(body, 250)}
										</TableCell>
										<TableCell className="align-top">
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

function preview(body: string, length: number = 65) {
	if (body.length < length) {
		return body;
	}

	const words = body.split(" ");
	let idx = 0;
	let sum = 0;
	while (true) {
		sum += words[idx].length;
		if (sum > length - 3) {
			break;
		}
		sum++; // compensates for a space
		idx++;
	}
	return words.slice(0, idx).join(" ").concat("...");
}
