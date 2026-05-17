import {SettingsPanel} from "@/components/settings/SettingsPanel";
import {PageScrollShell} from "@/components/app/page-scroll-shell";

export default function page() {
    return (
        <PageScrollShell>
            <SettingsPanel/>
        </PageScrollShell>
    )
}
