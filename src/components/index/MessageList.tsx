"use client"

import {useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import {ArrowLeft, ChevronDown} from "lucide-react";
import {Virtuoso, type VirtuosoHandle} from "react-virtuoso";
import {Button} from "@/components/ui/button";
import {MessageBox} from "@/components/index/MessageBox";
import {MessageTimeDivider} from "@/components/index/MessageTimeDivider";
import {useChat} from "@/components/index/chat-provider";
import {
    formatMessageTimeDivider,
    shouldShowMessageTimeDivider,
} from "@/lib/message-time";
import {useAppLocale, useAppTranslations} from "@/i18n/use-app-translations";

const PRELOAD_EDGE_ITEMS = 8;

export function MessageList({onBack}: { onBack?: () => void }) {
    const {
        messages,
        firstMessageItemIndex,
        hasOlderMessages,
        hasNewerMessages,
        loadingOlderMessages,
        loadingNewerMessages,
        pendingNewerCount,
        selectedFriend,
        setConversationAtBottom,
        acknowledgeCurrentConversation,
        markMessagesAsSeen,
        loadOlderMessages,
        loadNewerMessages,
        resendMessage,
    } = useChat();
    const locale = useAppLocale();
    const t = useAppTranslations();
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);
    const scrollerRef = useRef<HTMLElement | null>(null);
    const prependAnchorRef = useRef<{ messageId: string; top: number } | null>(null);
    const [atBottom, setAtBottom] = useState(true);

    const initialTopMostItemIndex = useMemo(() => {
        if (!messages.length) {
            return 0;
        }

        return firstMessageItemIndex + messages.length - 1;
    }, [firstMessageItemIndex, messages.length]);

    const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "smooth") => {
        if (!messages.length) {
            return;
        }

        virtuosoRef.current?.scrollToIndex({
            index: firstMessageItemIndex + messages.length - 1,
            align: "end",
            behavior,
        });
    }, [firstMessageItemIndex, messages.length]);

    const requestOlderMessages = useCallback((firstVisibleOffset: number) => {
        if (loadingOlderMessages || !hasOlderMessages || prependAnchorRef.current) {
            return;
        }

        const anchorMessage = messages[Math.max(0, firstVisibleOffset)];
        const anchorElement = anchorMessage
            ? scrollerRef.current?.querySelector<HTMLElement>(`[data-message-id="${anchorMessage.id}"]`)
            : null;

        if (anchorMessage && anchorElement) {
            prependAnchorRef.current = {
                messageId: anchorMessage.id,
                top: anchorElement.getBoundingClientRect().top,
            };
        }

        void loadOlderMessages();
    }, [hasOlderMessages, loadingOlderMessages, loadOlderMessages, messages]);

    useLayoutEffect(() => {
        if (loadingOlderMessages) {
            return;
        }

        const anchor = prependAnchorRef.current;
        const scrollerElement = scrollerRef.current;

        if (!anchor || !scrollerElement) {
            return;
        }

        const anchorElement = scrollerElement.querySelector<HTMLElement>(
            `[data-message-id="${anchor.messageId}"]`
        );

        if (anchorElement) {
            const delta = anchorElement.getBoundingClientRect().top - anchor.top;

            if (Math.abs(delta) > 0.5) {
                scrollerElement.scrollTop += delta;
            }
        }

        prependAnchorRef.current = null;
    }, [firstMessageItemIndex, loadingOlderMessages, messages]);

    if (!selectedFriend) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border text-sm text-muted-foreground">
                {t("selectFriend")}
            </div>
        )
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
            <div className="shrink-0 border-b px-4 pb-3 pt-4">
                <div className="flex items-center gap-3">
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
            </div>
            <div className="relative min-h-0 flex-1">
                {messages.length ? (
                    <Virtuoso
                        key={selectedFriend.id}
                        ref={virtuosoRef}
                        scrollerRef={(element) => {
                            scrollerRef.current = element instanceof HTMLElement ? element : null;
                        }}
                        data={messages}
                        firstItemIndex={firstMessageItemIndex}
                        className="telecat-scrollbar h-full"
                        initialTopMostItemIndex={initialTopMostItemIndex}
                        alignToBottom
                        atBottomThreshold={160}
                        followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
                        atBottomStateChange={(nextAtBottom) => {
                            setAtBottom(nextAtBottom);
                            setConversationAtBottom(nextAtBottom);
                        }}
                        rangeChanged={(range) => {
                            const firstVisibleOffset = range.startIndex - firstMessageItemIndex;
                            const lastVisibleOffset =
                                firstMessageItemIndex + messages.length - 1 - range.endIndex;

                            if (
                                firstVisibleOffset <= PRELOAD_EDGE_ITEMS &&
                                hasOlderMessages &&
                                !loadingOlderMessages
                            ) {
                                requestOlderMessages(firstVisibleOffset);
                            }

                            if (
                                lastVisibleOffset <= PRELOAD_EDGE_ITEMS &&
                                hasNewerMessages &&
                                !loadingNewerMessages
                            ) {
                                void loadNewerMessages();
                            }

                            if (pendingNewerCount > 0) {
                                const visibleStart = Math.max(0, firstVisibleOffset);
                                const visibleEnd = Math.min(
                                    messages.length - 1,
                                    range.endIndex - firstMessageItemIndex
                                );
                                const visibleNewMessages = messages
                                    .slice(visibleStart, visibleEnd + 1)
                                    .filter((message) => !message.isMe && message.isNew);

                                if (visibleNewMessages.length > 0) {
                                    markMessagesAsSeen(visibleStart, visibleEnd);
                                    void acknowledgeCurrentConversation(
                                        visibleNewMessages.map((message) => message.id)
                                    );
                                }
                            }

                        }}
                        itemContent={(index, message) => {
                            const relativeIndex = index - firstMessageItemIndex;
                            const previousMessage = messages[relativeIndex - 1];
                            const showTime = shouldShowMessageTimeDivider(
                                message.createdAt,
                                previousMessage?.createdAt
                            );

                            return (
                                <div className="px-4 py-1.5" data-message-id={message.id}>
                                    <div className="flex flex-col gap-3">
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
                                            deliveryStatus={message.deliveryStatus}
                                            isNew={message.isNew}
                                            onRetry={() => resendMessage(message.id)}
                                        />
                                    </div>
                                </div>
                            );
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        {t("noMessages")}
                    </div>
                )}
                <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-2">
                    {pendingNewerCount > 0 && !atBottom ? (
                        <button
                            type="button"
                            className="pointer-events-auto flex items-center gap-2 rounded-full bg-unread px-3 py-2 text-sm text-unread-foreground shadow-sm transition hover:bg-unread/90"
                            onClick={async () => {
                                if (hasNewerMessages) {
                                    await loadNewerMessages();
                                }
                                scrollToBottom("smooth");
                            }}
                        >
                            <span>{t("newMessagesCount", {count: pendingNewerCount})}</span>
                            <ChevronDown data-icon="inline-start"/>
                        </button>
                    ) : null}
                    {!atBottom ? (
                        <Button
                            type="button"
                            size="icon-sm"
                            className="pointer-events-auto bg-unread text-unread-foreground shadow-sm hover:bg-unread/90"
                            onClick={() => scrollToBottom("smooth")}
                        >
                            <ChevronDown data-icon="inline-start"/>
                            <span className="sr-only">{t("scrollToBottom")}</span>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
