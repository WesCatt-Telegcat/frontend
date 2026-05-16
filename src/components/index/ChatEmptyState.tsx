"use client"

import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {useAppPreferences} from "@/components/app/preferences-provider";
import {cn} from "@/lib/utils";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function ChatEmptyState() {
    const {theme} = useAppPreferences();
    const t = useAppTranslations();

    return (
        <Empty className="min-h-0 flex-1 border bg-background">
            <EmptyHeader>
                <EmptyMedia>
                    <div
                        role="img"
                        aria-label="Telecat"
                        className={cn(
                            "size-32 bg-foreground opacity-90 md:size-40",
                            "logo-mask",
                            theme === "light" && "bg-muted-foreground opacity-35"
                        )}
                    />
                </EmptyMedia>
                <EmptyTitle>{t("selectFriend")}</EmptyTitle>
            </EmptyHeader>
        </Empty>
    )
}
