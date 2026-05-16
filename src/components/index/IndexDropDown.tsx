"use client"

import {FormEvent, useState} from "react";
import {LinkIcon, Plus, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {useChat} from "@/components/index/chat-provider";
import type {FriendSearchResult} from "@/lib/types";
import {FieldErrorLine} from "@/components/form/field-error-line";
import {useAppTranslations} from "@/i18n/use-app-translations";

function mapFriendError(message: string, t: ReturnType<typeof useAppTranslations>) {
    if (
        message.includes("唯一 ID 长度必须在 4 到 40 个字符之间") ||
        message.includes("friendCode must be longer than or equal to 4 characters") ||
        message.includes("friendCode must be shorter than or equal to 40 characters")
    ) {
        return t("friendCodeInvalidLength");
    }

    if (message.includes("好友申请已发送")) {
        return t("requestPending");
    }

    if (message.includes("没有找到该用户")) {
        return t("friendNotFound");
    }

    if (message.includes("不能添加自己")) {
        return t("cannotAddSelf");
    }

    if (message.includes("已经是好友")) {
        return t("alreadyFriends");
    }

    if (message.includes("重新登录以更新加密密钥")) {
        return t("friendKeyRefreshRequired");
    }

    if (message.includes("还没有初始化加密密钥")) {
        return t("friendKeyMissing");
    }

    if (message.includes("好友链接") && message.includes("无效")) {
        return t("invalidFriendLink");
    }

    return message;
}

function mapRelationLabel(
    relation: FriendSearchResult["relation"],
    t: ReturnType<typeof useAppTranslations>
) {
    if (relation === "SELF") {
        return t("relationSelf");
    }

    if (relation === "FRIEND") {
        return t("relationFriend");
    }

    if (relation === "REQUESTED") {
        return t("relationRequested");
    }

    if (relation === "NEED_ACCEPT") {
        return t("relationNeedAccept");
    }

    return t("relationNone");
}

export function IndexDropDown() {
    const {searchFriend, sendFriendRequest, addFriendByLink} = useChat();
    const t = useAppTranslations();
    const [open, setOpen] = useState(false);
    const [friendCode, setFriendCode] = useState("");
    const [friendLink, setFriendLink] = useState("");
    const [result, setResult] = useState<FriendSearchResult | null>(null);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<{friendCode?: string; friendLink?: string}>({});
    const [pending, setPending] = useState(false);

    async function handleSearch() {
        setMessage("");
        if (!friendCode.trim()) {
            setErrors({friendCode: t("friendCodeRequired")});
            return;
        }

        setErrors({});
        setPending(true);

        try {
            setResult(await searchFriend(friendCode));
        } catch (err) {
            setResult(null);
            setErrors({
                friendCode:
                    err instanceof Error ? mapFriendError(err.message, t) : t("search"),
            });
        } finally {
            setPending(false);
        }
    }

    async function handleRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        if (!friendCode.trim()) {
            setErrors({friendCode: t("friendCodeRequired")});
            return;
        }

        setErrors({});
        setPending(true);

        try {
            await sendFriendRequest(friendCode);
            setMessage(t("requestSent"));
        } catch (err) {
            setErrors({
                friendCode:
                    err instanceof Error
                        ? mapFriendError(err.message, t)
                        : t("sendRequest"),
            });
        } finally {
            setPending(false);
        }
    }

    async function handleLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        if (!friendLink.trim()) {
            setErrors({friendLink: t("friendLinkRequired")});
            return;
        }

        setErrors({});
        setPending(true);

        try {
            await addFriendByLink(friendLink);
            setMessage(t("friendAdded"));
            setFriendLink("");
            setOpen(false);
        } catch (err) {
            setErrors({
                friendLink:
                    err instanceof Error
                        ? mapFriendError(err.message, t)
                        : t("addByLink"),
            });
        } finally {
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                    <Plus data-icon="inline-start"/>
                    <span className="sr-only">{t("addFriend")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("addFriend")}</DialogTitle>
                    <DialogDescription>
                        {t("addFriendDesc")}
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <form className="flex flex-col gap-4" onSubmit={handleRequest}>
                        <Field data-invalid={Boolean(errors.friendCode)}>
                            <FieldLabel htmlFor="friend-code">{t("friendCode")}</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="friend-code"
                                    value={friendCode}
                                    placeholder="TC1234ABCD"
                                    onChange={(event) => setFriendCode(event.target.value)}
                                    aria-invalid={Boolean(errors.friendCode)}
                                />
                                <Button type="button" variant="outline" disabled={pending} onClick={handleSearch}>
                                    <Search data-icon="inline-start"/>
                                    {t("search")}
                                </Button>
                            </div>
                            <FieldErrorLine message={errors.friendCode}/>
                            <FieldDescription>{t("friendCodeDesc")}</FieldDescription>
                        </Field>
                        {result ? (
                            <div className="flex items-center justify-between rounded-xl border p-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{result.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">{result.email}</div>
                                </div>
                                <Badge variant="secondary">{mapRelationLabel(result.relation, t)}</Badge>
                            </div>
                        ) : null}
                        <Button
                            type="submit"
                            disabled={
                                pending ||
                                !friendCode ||
                                result?.relation === "REQUESTED" ||
                                result?.relation === "FRIEND" ||
                                result?.relation === "SELF"
                            }
                        >
                            {t("sendRequest")}
                        </Button>
                    </form>

                    <FieldSeparator className="[&_[data-slot=field-separator-content]]:bg-popover">
                        {t("or")}
                    </FieldSeparator>

                    <form className="flex flex-col gap-4" onSubmit={handleLink}>
                        <Field data-invalid={Boolean(errors.friendLink)}>
                            <FieldLabel htmlFor="friend-link">{t("friendLink")}</FieldLabel>
                            <Input
                                id="friend-link"
                                value={friendLink}
                                placeholder="http://localhost:2616?friend=TC1234ABCD"
                                onChange={(event) => setFriendLink(event.target.value)}
                                aria-invalid={Boolean(errors.friendLink)}
                            />
                            <FieldErrorLine message={errors.friendLink}/>
                            <FieldDescription>{t("friendLinkDesc")}</FieldDescription>
                        </Field>
                        <Button type="submit" disabled={pending || !friendLink}>
                            <LinkIcon data-icon="inline-start"/>
                            {t("addByLink")}
                        </Button>
                    </form>
                    {message ? <FieldDescription>{message}</FieldDescription> : null}
                </FieldGroup>
            </DialogContent>
        </Dialog>
    )
}
