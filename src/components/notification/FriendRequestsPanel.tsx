"use client"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useChat} from "@/components/index/chat-provider";
import dayjs from "dayjs";
import {Check, X} from "lucide-react";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function FriendRequestsPanel() {
    const {requests, respondRequest} = useChat();
    const t = useAppTranslations();

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">{t("incomingRequests")}</h1>
                    <p className="text-sm text-muted-foreground">{t("incomingRequestsDesc")}</p>
                </div>
                <Badge className="rounded-md bg-unread text-unread-foreground hover:bg-unread">
                    {requests.length}
                </Badge>
            </div>
            <Separator/>
            <div className="flex flex-col gap-2">
                {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Avatar>
                                <AvatarImage src={request.requester.avatar ?? "/user-default-avatar.jpg"} alt={request.requester.name}/>
                                <AvatarFallback>{request.requester.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{request.requester.name}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {request.requester.email} · {dayjs(request.createdAt).format("MM-DD HH:mm")}
                                </div>
                            </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button size="sm" onClick={() => respondRequest(request.id, true)}>
                                <Check data-icon="inline-start"/>
                                {t("accept")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => respondRequest(request.id, false)}>
                                <X data-icon="inline-start"/>
                                {t("reject")}
                            </Button>
                        </div>
                    </div>
                ))}
                {!requests.length ? (
                    <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                        {t("noRequests")}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
