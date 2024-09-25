import { FieldApi, FormOptions, useForm } from "@tanstack/react-form";
import { ZodValidator } from "@tanstack/zod-form-adapter";
import { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// FIX: this does not work
export default function DialogForm({
	buttonText,
	header,
	formOptions,
	children,
}: {
	buttonText: string;
	header: ReactNode;
	formOptions: FormOptions<FormData, ZodValidator>;
	children: ReactNode;
}) {
	const form = useForm(formOptions);

	return (
		<Dialog onOpenChange={form.reset}>
			<DialogTrigger asChild>
				<Button>{buttonText}</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>{header}</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					{children}
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button disabled={!canSubmit || isSubmitting} className="mt-4">
								{isSubmitting ? "Please Wait..." : "Submit"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
