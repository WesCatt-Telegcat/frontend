import {Badge} from "@/components/ui/badge"

export function Point({number = 0}) {

    if (number === 0) return
    return (
        <Badge className={'bg-blue-100 rounded-full text-blue-700'} variant="destructive">{number}</Badge>
    )
}