import {cn} from "@/lib/utils";

export function MessageTimeDivider({children, className}: {
    children: string
    className?: string
}) {
    return (
        <div className={cn("flex justify-center py-1", className)}>
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                {children}
            </span>
        </div>
    )
}
