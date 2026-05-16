"use client"

import {Bell, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import type {FriendRequest} from "@/lib/types";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function FriendRequestRealtimeAlert({
    request,
    onClose,
    onOpenRequests,
}: {
    request: FriendRequest
    onClose: () => void
    onOpenRequests: () => void
}) {
    const t = useAppTranslations();

    return (
        <div className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in slide-in-from-top-3 fade-in duration-300">
            <Alert className="bg-background shadow-lg">
                <Bell/>
                <AlertTitle>{t("newFriendRequest")}</AlertTitle>
                <AlertDescription>
                    {request.requester.name} {t("requestLine")}
                </AlertDescription>
                <AlertAction className="flex items-center gap-1">
                    <Button type="button" size="sm" onClick={onOpenRequests}>
                        {t("viewRequests")}
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
                        <X data-icon="inline-start"/>
                        <span className="sr-only">{t("close")}</span>
                    </Button>
                </AlertAction>
            </Alert>
        </div>
    )
}
