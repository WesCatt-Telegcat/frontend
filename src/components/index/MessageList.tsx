"use client"

import {useEffect, useRef} from "react";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {MessageBox} from "@/components/index/MessageBox";
import {MessageTimeDivider} from "@/components/index/MessageTimeDivider";
import {useChat} from "@/components/index/chat-provider";
import {
    formatMessageTimeDivider,
    shouldShowMessageTimeDivider,
} from "@/lib/message-time";
import {useAppLocale, useAppTranslations} from "@/i18n/use-app-translations";

export function MessageList({onBack}: { onBack?: () => void }) {
    const {messages, selectedFriend} = useChat();
    const locale = useAppLocale();
    const t = useAppTranslations();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({block: "end"});
    }, [messages]);

    if (!selectedFriend) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border text-sm text-muted-foreground">
                {t("selectFriend")}
            </div>
        )
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-3 border-b pb-3">
                {onBack ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="-ml-2 shrink-0"
                        onClick={onBack}
                    >
                        <ArrowLeft data-icon="inline-start"/>
                        <span className="sr-only">{t("chat")}</span>
                    </Button>
                ) : null}
                <div className="min-w-0">
                    <div className="truncate font-medium">{selectedFriend.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{selectedFriend.email}</div>
                </div>
            </div>
            {messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const showTime = shouldShowMessageTimeDivider(
                    message.createdAt,
                    previousMessage?.createdAt
                );

                return (
                    <div className="flex flex-col gap-3" key={message.id}>
                        {showTime ? (
                            <MessageTimeDivider>
                                {formatMessageTimeDivider(message.createdAt, locale, {
                                    today: t("messageToday"),
                                    yesterday: t("messageYesterday"),
                                })}
                            </MessageTimeDivider>
                        ) : null}
                        <MessageBox
                            message={message.content}
                            isMe={message.isMe}
                            time={message.createdAt}
                        />
                    </div>
                )
            })}
            {!messages.length ? (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    {t("noMessages")}
                </div>
            ) : null}
            <div ref={bottomRef}/>
        </div>
    )
}
