import {Badge} from "@/components/ui/badge"

export function Point({number = 0}) {

    if (number === 0) return null
    return (
        <Badge className="min-w-5 rounded-md bg-unread px-1.5 text-unread-foreground hover:bg-unread">
            {number}
        </Badge>
    )
}
