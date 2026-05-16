"use client"

import {InputBox} from "@/components/index/InputBox";
import {MessageList} from "@/components/index/MessageList";
import {useChat} from "@/components/index/chat-provider";
import {ChatEmptyState} from "@/components/index/ChatEmptyState";

export function ChatWindow({onBack}: { onBack?: () => void }) {
    const {selectedFriend} = useChat();

    if (!selectedFriend) {
        return <ChatEmptyState/>
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <MessageList onBack={onBack}/>
            <InputBox/>
        </div>
    )
}
