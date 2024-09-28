import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
										<TableCell>{body}</TableCell>
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
				<Card x-chunk="dashboard-01-chunk-5">
					<CardHeader>
						<CardTitle>Recent Sales</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/01.png" alt="Avatar" />
								<AvatarFallback>OM</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									Olivia Martin
								</p>
								<p className="text-sm text-muted-foreground">
									olivia.martin@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$1,999.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/02.png" alt="Avatar" />
								<AvatarFallback>JL</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">Jackson Lee</p>
								<p className="text-sm text-muted-foreground">
									jackson.lee@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$39.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/03.png" alt="Avatar" />
								<AvatarFallback>IN</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									Isabella Nguyen
								</p>
								<p className="text-sm text-muted-foreground">
									isabella.nguyen@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$299.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/04.png" alt="Avatar" />
								<AvatarFallback>WK</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">William Kim</p>
								<p className="text-sm text-muted-foreground">will@email.com</p>
							</div>
							<div className="ml-auto font-medium">+$99.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/05.png" alt="Avatar" />
								<AvatarFallback>SD</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">Sofia Davis</p>
								<p className="text-sm text-muted-foreground">
									sofia.davis@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$39.00</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
