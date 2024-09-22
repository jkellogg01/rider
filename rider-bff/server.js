import { createRequestHandler } from "@remix-run/express";
import express from "express";
import proxy from "express-http-proxy";

const vite =
	process.env.NODE_ENV === "production"
		? null
		: await import("vite").then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
			);

const app = express();

const proxyURL = process.env.PROXY_URL || "http://127.0.0.1:8000";
app.use("/api", proxy(proxyURL));

app.use(vite ? vite.middlewares : express.static("build/client"));

const buildPath = "./build/server/index.js";
const build = vite
	? () => vite.ssrLoadModule("virtual:remix/server-build")
	: await import(buildPath);
console.assert(build, "could not import handler from %s", buildPath);

app.all("*", createRequestHandler({ build }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
