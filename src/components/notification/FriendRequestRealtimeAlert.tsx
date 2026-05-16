"use client"

import {useCallback, useEffect, useState} from "react";
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
import {cn} from "@/lib/utils";

const ALERT_DURATION_MS = 5200;
const ALERT_EXIT_MS = 220;

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
    const [closing, setClosing] = useState(false);

    const handleClose = useCallback(() => {
        setClosing(true);
        window.setTimeout(() => {
            onClose();
        }, ALERT_EXIT_MS);
    }, [onClose]);

    const handleOpenRequests = useCallback(() => {
        setClosing(true);
        window.setTimeout(() => {
            onOpenRequests();
        }, ALERT_EXIT_MS);
    }, [onOpenRequests]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            handleClose();
        }, ALERT_DURATION_MS);

        return () => window.clearTimeout(timer);
    }, [handleClose, request.id]);

    return (
        <div
            className={cn(
                "w-full duration-300",
                closing
                    ? "animate-out slide-out-to-right-4 fade-out"
                    : "animate-in slide-in-from-right-4 fade-in"
            )}
        >
            <Alert className="overflow-hidden bg-background shadow-lg">
                <Bell/>
                <AlertTitle>{t("newFriendRequest")}</AlertTitle>
                <AlertDescription>
                    {request.requester.name} {t("requestLine")}
                </AlertDescription>
                <AlertAction className="flex items-center gap-1">
                    <Button type="button" size="sm" onClick={handleOpenRequests}>
                        {t("viewRequests")}
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
                        <X data-icon="inline-start"/>
                        <span className="sr-only">{t("close")}</span>
                    </Button>
                </AlertAction>
                <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="alert-progress-bar h-full rounded-full bg-unread"
                            style={{animationDuration: `${ALERT_DURATION_MS}ms`}}
                        />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                        {t("alertLeavingSoon")}
                    </span>
                </div>
            </Alert>
        </div>
    )
}
