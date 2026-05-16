import {FieldError} from "@/components/ui/field";

export function FieldErrorLine({message}: { message?: string }) {
    return (
        <FieldError className="min-h-4 text-xs leading-4">
            {message ? message : <span className="invisible">.</span>}
        </FieldError>
    )
}
