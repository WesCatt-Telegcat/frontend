import {SponsorPanel} from "@/components/sponsor/SponsorPanel";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function Page() {
    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="min-h-full pr-4">
                <SponsorPanel/>
            </div>
        </ScrollArea>
    );
}
