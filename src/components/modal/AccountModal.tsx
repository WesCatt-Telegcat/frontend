import React from "react";
import { Camera, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export  function AccountModal({open,onOpenChange}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                {/* Header Section */}
                <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b bg-white">
                    <DialogTitle className="text-xl font-bold">Edit profile</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-900 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-none text-white">
                                <Camera className="w-5 h-5" />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-none text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Avatar Section */}
                    <div className="absolute -bottom-10 left-6">
                        <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md">
                            <img
                                src="https://github.com/shadcn.png"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer hover:bg-black/40 transition">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="px-6 pt-14 pb-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">邮箱</Label>
                        <div className="relative">
                            <Input id="username" defaultValue="westcat@gmail.com" className="pr-10"/>
                            <Check className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <div className="relative">
                            <Input id="username" defaultValue="margaret-villard-69" className="pr-10"/>
                            <Check className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">好友链接</Label>
                        <div className="flex">
              <span
                  className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                https://
              </span>
                            <Input id="website" defaultValue="www.margaret.com" className="rounded-l-none"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">介绍</Label>
                        <Textarea
                            id="bio"
                            defaultValue="Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!"
                            className="resize-none h-24"
                        />
                        <p className="text-xs text-right text-muted-foreground">98 字符</p>
                    </div>
                </div>

                {/* Footer Section */}
                <DialogFooter className="px-6 py-4 bg-gray-50 flex sm:justify-between items-center border-t">
                    <Button variant="outline" className="px-8 border-gray-300">取消</Button>
                    <Button className="px-8 bg-zinc-900 hover:bg-zinc-800 text-white leading-none">保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}