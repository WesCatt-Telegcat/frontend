"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Check, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/types"
import { useAppTranslations } from "@/i18n/use-app-translations"

export function AccountModal({
    open,
    onOpenChange,
    user,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
}) {
    const t = useAppTranslations()
    const [copyNotices, setCopyNotices] = useState<number[]>([])

    async function copyFriendLink() {
        await navigator.clipboard.writeText(user.friendLink)
        const id = Date.now() + Math.random()

        setCopyNotices((current) => [...current, id])
        window.setTimeout(() => {
            setCopyNotices((current) => current.filter((noticeId) => noticeId !== id))
        }, 1400)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden border-none p-0 shadow-2xl sm:max-w-[480px]">
                <DialogHeader className="flex flex-row items-center justify-between border-b bg-background px-6 py-4">
                    <DialogTitle className="text-xl font-bold">{t("editProfile")}</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <div className="relative h-32 bg-gradient-to-r from-cyan-500 to-blue-900">
                        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-2">
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                <Camera />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                <X />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 px-6 pb-4">
                        <div className="-mt-12">
                            <div className="relative size-24 overflow-hidden rounded-full border-4 border-background shadow-md">
                                <Image
                                    src={user.avatar ?? "/user-default-avatar.jpg"}
                                    alt="Avatar"
                                    width={96}
                                    height={96}
                                    className="size-full object-cover"
                                />
                                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition hover:bg-black/40">
                                    <Camera className="text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0 pb-2">
                            <div className="truncate text-lg font-semibold text-foreground">{user.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{user.friendCode}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">{t("email")}</Label>
                        <div className="relative">
                            <Input id="email" defaultValue={user.email} className="pr-10" />
                            <Check className="absolute right-3 top-2.5 text-emerald-500" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">{t("username")}</Label>
                        <div className="relative">
                            <Input id="name" defaultValue={user.name} className="pr-10" />
                            <Check className="absolute right-3 top-2.5 text-emerald-500" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="website">{t("friendLink")}</Label>
                        <div className="relative">
                            <div className="flex">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                    {user.friendLink.startsWith("https://") ? "https://" : "http://"}
                                </span>
                                <Input
                                    id="website"
                                    value={user.friendLink.replace("https://", "").replace("http://", "")}
                                    readOnly
                                    className="rounded-none"
                                    onClick={copyFriendLink}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="rounded-l-none border-l-0"
                                    onClick={copyFriendLink}
                                >
                                    <Copy />
                                    <span className="sr-only">{t("copy")}</span>
                                </Button>
                            </div>
                            {copyNotices.map((noticeId) => (
                                <div
                                    key={noticeId}
                                    className="copy-float-tip pointer-events-none absolute left-1/2 top-1/2 rounded-md border bg-background px-3 py-1 text-xs shadow-sm"
                                >
                                    {t("copied")}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bio">{t("bio")}</Label>
                        <Textarea
                            id="bio"
                            defaultValue={`${t("myFriendId")}${user.friendCode}`}
                            className="h-24 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center border-t bg-muted px-6 py-4 sm:justify-between">
                    <Button variant="outline" onClick={()=>onOpenChange(false)} className="px-8">{t("cancel")}</Button>
                    <Button className="px-8 leading-none">{t("save")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
