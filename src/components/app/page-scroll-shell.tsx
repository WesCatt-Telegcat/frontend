import type {ReactNode} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";

export function PageScrollShell({children}: { children: ReactNode }) {
    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="min-h-full box-border p-2 sm:p-3">
                {children}
            </div>
        </ScrollArea>
    )
}
