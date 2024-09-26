import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export default function Header({ children }: { children?: ReactNode }) {
	return (
		<div className="w-full bg-background">
			<div className="h-16 container mx-auto pb-2 px-2 flex flex-row justify-between items-end">
				<Link
					to="/"
					className="[&.active]:cursor-default font-bold text-xl align-baseline"
				>
					Rider
				</Link>
				<div className="flex flex-row gap-2">{children}</div>
			</div>
			<hr />
		</div>
	);
}
