"use client"

import {
    BadgeCheck,
    ChevronsUpDown,
    LogOut,
    Settings,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {AccountModal} from "@/components/modal/AccountModal";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "@/components/auth/session-provider";
import type {User} from "@/lib/types";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function NavUser({
                            user,
                        }: {
    user: User | null
}) {

    const {isMobile} = useSidebar()
    const router = useRouter()
    const {logout} = useSession()
    const t = useAppTranslations()
    const [openAccountModal, setOpenAccountModal] = useState(false);
    const displayUser = user ?? {
        name: "Telecat",
        email: "未登录",
        avatar: null,
        friendCode: "",
        friendLink: "",
        id: "",
        encryptionPublicKey: null,
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={displayUser.avatar ?? "/user-default-avatar.jpg"} alt={displayUser.name}/>
                                <AvatarFallback className="rounded-lg">{displayUser.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{displayUser.name}</span>
                                <span className="truncate text-xs text-sidebar-foreground/70">
                                    {displayUser.friendCode || displayUser.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={displayUser.avatar ?? "/user-default-avatar.jpg"} alt={displayUser.name}/>
                                    <AvatarFallback className="rounded-lg">{displayUser.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{displayUser.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {displayUser.friendCode || displayUser.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => router.push("/sponsor")}>
                                <Sparkles/>
                                {t("sponsor")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={()=>setOpenAccountModal(true)}>
                                <BadgeCheck/>
                                {t("accountProfile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/settings")}>
                                <Settings/>
                                {t("settings")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut/>
                            {t("logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <AccountModal user={displayUser} onOpenChange={(v)=>setOpenAccountModal(v)} open={openAccountModal}></AccountModal>
        </SidebarMenu>
    )
}
