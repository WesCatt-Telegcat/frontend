"use client"

import {useRef, useState} from "react";
import {Send} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {useChat} from "@/components/index/chat-provider";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function InputBox() {
    const {selectedFriend, sendMessage} = useChat();
    const t = useAppTranslations();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const hasContentRef = useRef(false);
    const [hasContent, setHasContent] = useState(false);

    function syncHasContent() {
        const nextHasContent = Boolean(textareaRef.current?.value.trim());

        if (hasContentRef.current === nextHasContent) {
            return;
        }

        hasContentRef.current = nextHasContent;
        setHasContent(nextHasContent);
    }

    function handleSend() {
        const nextContent = textareaRef.current?.value.trim() ?? "";
        if (!nextContent || !selectedFriend) {
            return;
        }

        if (textareaRef.current) {
            textareaRef.current.value = "";
        }
        hasContentRef.current = false;
        setHasContent(false);
        sendMessage(nextContent);
        window.requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    }

    return (
        <div className="shrink-0 p-1">
            <InputGroup className="min-h-14 items-center">
                <InputGroupTextarea
                    ref={textareaRef}
                    disabled={!selectedFriend}
                    onInput={syncHasContent}
                    placeholder={selectedFriend ? t("messagePlaceholder") : t("chooseFriendPlaceholder")}
                    className="min-h-14 py-3"
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <InputGroupAddon align="inline-end" className="pr-3 has-[>button]:mr-0">
                    <InputGroupButton
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-8 bg-unread px-3 text-unread-foreground hover:bg-unread/90"
                        disabled={!selectedFriend || !hasContent}
                        onClick={handleSend}
                    >
                        <Send data-icon="inline-start"/>
                        {t("send")}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}
