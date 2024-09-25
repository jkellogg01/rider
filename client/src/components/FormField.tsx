import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface FieldProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label: string;
	className?: string;
	errors?: string;
}

export function Field({ name, className, label, errors, ...rest }: FieldProps) {
	return (
		<div className={`${className} mb-2`}>
			<Label htmlFor={name}>
				{label}
				{errors ? (
					<span className="text-muted-foreground"> &middot; {errors}</span>
				) : null}
			</Label>
			<Input id={name} {...rest} />
		</div>
	);
}
