import {FriendRequestsPanel} from "@/components/notification/FriendRequestsPanel";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function page(){
    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="min-h-full pr-4">
                <FriendRequestsPanel/>
            </div>
        </ScrollArea>
    )
}
