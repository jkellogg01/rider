import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ValidationError } from "@tanstack/react-form";

export interface FieldProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label: string;
	className?: string;
	errors?: Array<ValidationError>;
}

export function Field({ name, className, label, errors, ...rest }: FieldProps) {
	return (
		<div className={className}>
			<Label htmlFor={name}>{label}</Label>
			<Input id={name} {...rest} />
			{!!errors && (
				<p className="mt-2 text-destructive-foreground">{errors.join(", ")}</p>
			)}
		</div>
	);
}
