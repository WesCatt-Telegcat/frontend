'use client'
import React, {useState} from "react";
import {Badge} from "@/components/ui/badge";
import {MessageBox} from "@/components/index/MessageBox";

export function MessageList() {
    const [Lists, setLists] = useState([
        {
            isMe: false,
            message: '不是我'
        },
        {
            isMe: true,
            message: '是我'
        },
        {
            isMe: false,
            message: '不是我'
        },
        {
            isMe: true,
            message: '是我'
        },
        {
            isMe: false,
            message: '不是我'
        },
        {
            isMe: true,
            message: '是我'
        }
    ])

    return <div>
        {Lists.map((list, i) => (
            <MessageBox message={list.message} isMe={list.isMe} key={i}></MessageBox>
        ))}
    </div>
}