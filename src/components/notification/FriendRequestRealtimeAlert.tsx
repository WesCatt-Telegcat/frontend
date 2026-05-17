"use client"

import {useCallback, useEffect, useState} from "react";
import {Bell, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Alert,
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
    const [remainingMs, setRemainingMs] = useState(ALERT_DURATION_MS);

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
        const countdown = window.setInterval(() => {
            setRemainingMs((current) => Math.max(0, current - 100));
        }, 100);

        return () => {
            window.clearTimeout(timer);
            window.clearInterval(countdown);
        };
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
                <AlertDescription className="col-start-2 mt-1">
                    {request.requester.name} {t("requestLine")}
                </AlertDescription>
                <div className="col-start-2 mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button type="button" size="sm" onClick={handleOpenRequests}>
                        {t("viewRequests")}
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
                        <X data-icon="inline-start"/>
                        <span className="sr-only">{t("close")}</span>
                    </Button>
                </div>
                <div className="col-start-2 mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-unread transition-[width] duration-100"
                            style={{width: `${(remainingMs / ALERT_DURATION_MS) * 100}%`}}
                        />
                    </div>
                    <span className="min-w-10 text-right text-[11px] text-muted-foreground">
                        {Math.ceil(remainingMs / 1000)}s
                    </span>
                </div>
                <div className="col-start-2 text-[11px] text-muted-foreground">
                    {t("alertLeavingSoon")}
                </div>
            </Alert>
        </div>
    )
}
