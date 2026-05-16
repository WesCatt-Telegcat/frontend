import {SettingsPanel} from "@/components/settings/SettingsPanel";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function page() {
    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="min-h-full pr-4">
                <SettingsPanel/>
            </div>
        </ScrollArea>
    )
}
