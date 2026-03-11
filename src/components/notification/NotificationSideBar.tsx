import {SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInput} from "@/components/ui/sidebar";
import {Label} from "@/components/ui/label";
import {IndexDropDown} from "@/components/index/IndexDropDown";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Point} from "@/components/index/Point";
import * as React from "react";
import {useState} from "react";

export function NotificationSideBar() {

    const [list, setList] = useState([
        {
            name: "William Smith",
            email: "williamsmith@example.com",
            date: "09:34 AM",
            teaser:
                "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
            isActive: true
        },
        {
            name: "Alice Smith",
            email: "alicesmith@example.com",
            date: "Yesterday",
            teaser:
                "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
            isActive: false
        },
    ]);

    return (
        <>
            <SidebarHeader className="gap-3.5 border-b p-4">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">
                        通知
                    </div>
                    <Label className="flex items-center gap-2 text-sm">
                        <IndexDropDown/>
                    </Label>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        {list.map((user) => (

                            <a
                                href="#"
                                key={user.email}
                                className={`${user.isActive ? 'bg-muted' : ''} flex flex-col items-start gap-2 border-b py-2 px-2 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
                            >
                                <div className='flex gap-2  items-center justify-between w-full'>
                                    <div className='flex gap-2  items-center'>
                                        <Avatar>
                                            <AvatarImage
                                                src="/user-default-avatar.jpg"
                                                alt="avatar"/>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    <span className="ml-auto text-xs">{user.date}</span>
                                </div>
                                <div className={"flex"}>
                                        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                    {user.teaser}
                  </span>
                                    <Point number={2}></Point>
                                </div>

                            </a>
                        ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}