import {FriendRequestsPanel} from "@/components/notification/FriendRequestsPanel";
import {PageScrollShell} from "@/components/app/page-scroll-shell";

export default function page(){
    return (
        <PageScrollShell>
            <FriendRequestsPanel/>
        </PageScrollShell>
    )
}
