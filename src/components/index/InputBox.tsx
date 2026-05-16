"use client"

import {FormEvent, useState} from "react";
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
    const [content, setContent] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextContent = content.trim();
        if (!nextContent || !selectedFriend) {
            return;
        }

        setPending(true);
        try {
            await sendMessage(nextContent);
            setContent("");
        } finally {
            setPending(false);
        }
    }

    return (
        <form className="shrink-0 p-1" onSubmit={handleSubmit}>
            <InputGroup className="min-h-14 items-center">
                <InputGroupTextarea
                    value={content}
                    disabled={!selectedFriend || pending}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={selectedFriend ? t("messagePlaceholder") : t("chooseFriendPlaceholder")}
                    className="min-h-14 py-3"
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                />
                <InputGroupAddon align="inline-end" className="pr-3 has-[>button]:mr-0">
                    <InputGroupButton
                        type="submit"
                        variant="default"
                        size="sm"
                        className="h-8 bg-unread px-3 text-unread-foreground hover:bg-unread/90"
                        disabled={!selectedFriend || pending || !content.trim()}
                    >
                        <Send data-icon="inline-start"/>
                        {t("send")}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </form>
    )
}
