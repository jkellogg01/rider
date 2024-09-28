import { z } from "zod";

export const createUserSchema = z.object({
	givenName: z.string().min(1),
	familyName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
});

const getUserSchema = z.object({
	id: z.number().int().min(1),
	givenName: z.string().min(1),
	familyName: z.string().min(1),
	email: z.string().email(),
});

export async function getCurrentUser() {
	const res = await fetch("/api/me");
	if (!res.ok) {
		throw new Error("something went wrong while fetching the current user");
	}
	const data = await res.json();
	return getUserSchema.parse(data);
}
