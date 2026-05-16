"use client"

import {type TouchEvent, useEffect, useRef, useState} from "react";
import {ChatWindow} from "@/components/index/ChatWindow";
import {SidebarInner} from "@/components/index/SidebarInner";
import {useChat} from "@/components/index/chat-provider";
import {useIsMobile} from "@/hooks/use-mobile";
import {cn} from "@/lib/utils";

const SWIPE_EDGE_WIDTH = 32;
const SWIPE_CLOSE_DISTANCE = 80;

export function ChatWorkspace() {
    const {selectedFriend, setConversationVisible} = useChat();
    const isMobile = useIsMobile();
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const swipeRef = useRef({
        active: false,
        startX: 0,
        offset: 0,
    });
    const chatVisible = Boolean(selectedFriend && mobileChatOpen);

    useEffect(() => {
        const visible = isMobile
            ? Boolean(selectedFriend && mobileChatOpen)
            : Boolean(selectedFriend);

        setConversationVisible(visible);

        return () => {
            setConversationVisible(false);
        };
    }, [isMobile, mobileChatOpen, selectedFriend, setConversationVisible]);

    function openMobileChat() {
        setDragOffset(0);
        setMobileChatOpen(true);
    }

    function closeMobileChat() {
        swipeRef.current.active = false;
        swipeRef.current.offset = 0;
        setDragging(false);
        setDragOffset(0);
        setMobileChatOpen(false);
    }

    function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
        const touch = event.touches[0];

        if (!touch || touch.clientX > SWIPE_EDGE_WIDTH) {
            return;
        }

        swipeRef.current = {
            active: true,
            startX: touch.clientX,
            offset: 0,
        };
        setDragging(true);
    }

    function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
        if (!swipeRef.current.active) {
            return;
        }

        const touch = event.touches[0];
        const nextOffset = Math.max(0, touch.clientX - swipeRef.current.startX);

        swipeRef.current.offset = nextOffset;
        setDragOffset(nextOffset);
    }

    function handleTouchEnd() {
        if (!swipeRef.current.active) {
            return;
        }

        const shouldClose = swipeRef.current.offset > SWIPE_CLOSE_DISTANCE;

        swipeRef.current.active = false;
        swipeRef.current.offset = 0;
        setDragging(false);

        if (shouldClose) {
            closeMobileChat();
            return;
        }

        setDragOffset(0);
    }

    return (
        <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
            <div className="hidden min-h-0 flex-1 overflow-hidden md:flex">
                <ChatWindow/>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-sidebar md:hidden">
                <SidebarInner onSelectFriend={openMobileChat}/>
            </div>

            <div
                className={cn(
                    "absolute inset-0 z-20 flex min-h-0 touch-pan-y flex-col bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden",
                    chatVisible ? "pointer-events-auto" : "pointer-events-none"
                )}
                style={{
                    transform: chatVisible
                        ? `translateX(${dragOffset}px)`
                        : "translateX(100%)",
                    transitionDuration: dragging ? "0ms" : undefined,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {selectedFriend ? <ChatWindow onBack={closeMobileChat}/> : null}
            </div>
        </div>
    )
}
