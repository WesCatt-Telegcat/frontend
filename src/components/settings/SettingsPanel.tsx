"use client"

import {useState} from "react";
import {Check, Languages, Palette, Plus, Trash2, UserRound} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {AccountModal} from "@/components/modal/AccountModal";
import {useAppPreferences} from "@/components/app/preferences-provider";
import {useSession} from "@/components/auth/session-provider";
import {accentPresets, accentTextColorPresets} from "@/lib/app-preferences";
import {cn} from "@/lib/utils";
import {useAppTranslations} from "@/i18n/use-app-translations";

type ColorEditorTarget = "accent" | "accentText";

export function SettingsPanel() {
    const {user} = useSession();
    const {
        accentColor,
        accentTextColor,
        customAccentColors,
        customAccentTextColors,
        locale,
        setAccentColor,
        setAccentTextColor,
        setLocale,
        setTheme,
        theme,
        addCustomAccentColor,
        addCustomAccentTextColor,
        removeCustomAccentColor,
        removeCustomAccentTextColor,
        updateCustomAccentColor,
        updateCustomAccentTextColor,
    } = useAppPreferences();
    const t = useAppTranslations();
    const [profileOpen, setProfileOpen] = useState(false);
    const [editorTarget, setEditorTarget] = useState<ColorEditorTarget>("accent");
    const [accentEditorOpen, setAccentEditorOpen] = useState(false);
    const [editingCustomIndex, setEditingCustomIndex] = useState<number | null>(null);
    const [draftColor, setDraftColor] = useState("#2563eb");

    function openColorEditor(target: ColorEditorTarget, color: string, index: number | null = null) {
        setEditorTarget(target);
        setEditingCustomIndex(index);
        setDraftColor(color);
        setAccentEditorOpen(true);
    }

    function openCreateAccentEditor() {
        openColorEditor("accent", "#2563eb");
    }

    function openEditAccentEditor(index: number, color: string) {
        openColorEditor("accent", color, index);
    }

    function openCreateAccentTextEditor() {
        openColorEditor("accentText", "#ffffff");
    }

    function openEditAccentTextEditor(index: number, color: string) {
        openColorEditor("accentText", color, index);
    }

    function handleAccentConfirm() {
        if (editorTarget === "accent") {
            if (editingCustomIndex === null) {
                addCustomAccentColor(draftColor);
            } else {
                updateCustomAccentColor(editingCustomIndex, draftColor);
            }
        } else if (editingCustomIndex === null) {
            addCustomAccentTextColor(draftColor);
        } else {
            updateCustomAccentTextColor(editingCustomIndex, draftColor);
        }

        setAccentEditorOpen(false);
    }

    if (!user) {
        return null;
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4">
            <Card>
                <CardHeader className="gap-1">
                    <CardTitle>{t("info")}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <Avatar className="size-16 rounded-lg">
                                <AvatarImage src={user.avatar ?? "/user-default-avatar.jpg"} alt={user.name}/>
                                <AvatarFallback className="rounded-lg">{user.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-1">
                                <div className="truncate text-lg font-semibold">{user.name}</div>
                                <div className="truncate text-xs text-muted-foreground">{user.friendCode}</div>
                            </div>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setProfileOpen(true)}>
                            <UserRound data-icon="inline-start"/>
                            {t("profileAction")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="gap-1">
                    <CardTitle>{t("appearance")}</CardTitle>
                    <CardDescription>
                        {t("languageLabel")} · {t("theme")} · {t("accentColor")} · {t("accentTextColor")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 rounded-lg border px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium">{t("languageLabel")}</div>
                                <div className="text-xs text-muted-foreground">{locale === "zh" ? "中文" : "English"}</div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        <Languages data-icon="inline-start"/>
                                        {locale === "zh" ? "中文" : "English"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => setLocale("zh")}>
                                            中文
                                            {locale === "zh" ? <Check className="ml-auto"/> : null}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLocale("en")}>
                                            English
                                            {locale === "en" ? <Check className="ml-auto"/> : null}
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t pt-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium">{t("theme")}</div>
                                <div className="text-xs text-muted-foreground">
                                    {theme === "dark" ? t("darkTheme") : t("lightTheme")}
                                </div>
                            </div>
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-lg border px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Palette/>
                            {t("accentColor")}
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                {accentPresets.map((color) => (
                                    <Button
                                        key={color.value}
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "size-10 rounded-md p-0",
                                            accentColor === color.value && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                        )}
                                        onClick={() => setAccentColor(color.value)}
                                    >
                                        <span
                                            className="size-5 rounded-sm"
                                            style={{background: color.value}}
                                        />
                                        <span className="sr-only">{color.name}</span>
                                    </Button>
                                ))}
                                {customAccentColors.map((color, index) => (
                                    <div key={`${color}-${index}`} className="group relative">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className={cn(
                                                "size-10 rounded-md p-0",
                                                accentColor === color && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                            )}
                                            onClick={() => openEditAccentEditor(index, color)}
                                        >
                                            <span
                                                className="size-5 rounded-sm"
                                                style={{background: color}}
                                            />
                                            <span className="sr-only">{color}</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon-xs"
                                            className="absolute -right-1 -top-1 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removeCustomAccentColor(index);
                                            }}
                                        >
                                            <Trash2/>
                                            <span className="sr-only">{t("deleteAccent")}</span>
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-10 rounded-md"
                                    onClick={openCreateAccentEditor}
                                >
                                    <Plus data-icon="inline-start"/>
                                    <span className="sr-only">{t("customAccent")}</span>
                                </Button>
                            </div>
                            <div className="border-t pt-3">
                                <div className="mb-3 text-xs text-muted-foreground">{t("accentTextColor")}</div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {accentTextColorPresets.map((color) => (
                                        <Button
                                            key={color.value}
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className={cn(
                                                "size-10 rounded-md p-0",
                                                accentTextColor === color.value && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                            )}
                                            onClick={() => setAccentTextColor(color.value)}
                                        >
                                            <span
                                                className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-unread px-1 text-[10px] font-semibold uppercase"
                                                style={{color: color.value}}
                                            >
                                                Aa
                                            </span>
                                            <span className="sr-only">{color.name}</span>
                                        </Button>
                                    ))}
                                    {customAccentTextColors.map((color, index) => (
                                        <div key={`${color}-${index}`} className="group relative">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className={cn(
                                                    "size-10 rounded-md p-0",
                                                    accentTextColor === color && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                                )}
                                                onClick={() => openEditAccentTextEditor(index, color)}
                                            >
                                                <span
                                                    className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-unread px-1 text-[10px] font-semibold uppercase"
                                                    style={{color}}
                                                >
                                                    Aa
                                                </span>
                                                <span className="sr-only">{color}</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon-xs"
                                                className="absolute -right-1 -top-1 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeCustomAccentTextColor(index);
                                                }}
                                            >
                                                <Trash2/>
                                                <span className="sr-only">{t("deleteAccent")}</span>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-10 rounded-md"
                                        onClick={openCreateAccentTextEditor}
                                    >
                                        <Plus data-icon="inline-start"/>
                                        <span className="sr-only">{t("customAccentText")}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AccountModal user={user} open={profileOpen} onOpenChange={setProfileOpen}/>
            <Dialog open={accentEditorOpen} onOpenChange={setAccentEditorOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editorTarget === "accent"
                                ? editingCustomIndex === null
                                    ? t("createAccent")
                                    : t("editAccent")
                                : editingCustomIndex === null
                                    ? t("createAccentTextColor")
                                    : t("editAccentTextColor")}
                        </DialogTitle>
                        <DialogDescription>
                            {editorTarget === "accent" ? t("customAccent") : t("customAccentText")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                            <input
                                id="accent-color-picker"
                                type="color"
                                value={draftColor}
                                onChange={(event) => setDraftColor(event.target.value)}
                                className="size-14 cursor-pointer rounded-md border bg-transparent p-1"
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <Label htmlFor="accent-color-picker">
                                    {editorTarget === "accent" ? t("accentColor") : t("accentTextColor")}
                                </Label>
                                <Input value={draftColor} readOnly className="font-mono uppercase"/>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAccentEditorOpen(false)}
                        >
                            {t("cancel")}
                        </Button>
                        <Button type="button" onClick={handleAccentConfirm}>
                            {t("confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
