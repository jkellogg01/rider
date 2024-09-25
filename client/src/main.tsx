import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import "./index.css";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// HACK: idk there may be a better way to do this but it works!
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersDark.matches) {
	const htmlElement = document.getElementsByTagName("html").item(0)!;
	htmlElement.classList.add("dark");
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
