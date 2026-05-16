"use client"

import {useState} from "react";
import Image from "next/image";
import {Expand, QrCode, ShieldCheck, Sparkles, Wallet} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {useAppTranslations} from "@/i18n/use-app-translations";

const qrItems = [
    {
        key: "alipay",
        titleKey: "sponsorMethodAlipay",
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
        src: "/donations/alipay-qr.png",
        filePath: "frontend/public/donations/alipay-qr.png",
    },
    {
        key: "wechat",
        titleKey: "sponsorMethodWechat",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        src: "/donations/wechat-qr.png",
        filePath: "frontend/public/donations/wechat-qr.png",
    },
] as const;

export function SponsorPanel() {
    const t = useAppTranslations();
    const [previewKey, setPreviewKey] = useState<string | null>(null);
    const [missingMap, setMissingMap] = useState<Record<string, boolean>>({});

    const previewItem = qrItems.find((item) => item.key === previewKey) ?? null;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
            <Card>
                <CardHeader className="gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="size-4"/>
                        {t("sponsor")}
                    </div>
                    <CardTitle className="text-2xl">{t("sponsorTitle")}</CardTitle>
                    <CardDescription>{t("sponsorStaticDesc")}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {qrItems.map((item) => {
                    const isMissing = missingMap[item.key] ?? false;

                    return (
                        <Card key={item.key} className="overflow-hidden">
                            <CardHeader className="gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex size-11 items-center justify-center rounded-lg ${item.color}`}>
                                            <Wallet className="size-5"/>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{t(item.titleKey)}</CardTitle>
                                            <CardDescription>{t("sponsorMethodQr")}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        {isMissing ? t("sponsorQrMissing") : t("sponsorMethodQr")}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/30 p-5">
                                    {isMissing ? (
                                        <div className="flex w-full max-w-[16rem] flex-col items-center gap-3 text-center">
                                            <div className="flex size-14 items-center justify-center rounded-lg bg-background shadow-sm">
                                                <QrCode className="size-7"/>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {t("sponsorQrHint")}
                                            </div>
                                            <code className="rounded-md bg-background px-3 py-2 text-xs text-foreground">
                                                {item.filePath}
                                            </code>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="group relative w-full max-w-[18rem]"
                                            onClick={() => setPreviewKey(item.key)}
                                        >
                                            <Image
                                                src={item.src}
                                                alt={t(item.titleKey)}
                                                width={320}
                                                height={320}
                                                unoptimized
                                                className="aspect-square w-full rounded-xl border bg-white object-contain p-4 shadow-sm"
                                                onError={() =>
                                                    setMissingMap((current) => ({
                                                        ...current,
                                                        [item.key]: true,
                                                    }))
                                                }
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition group-hover:bg-black/8">
                                                <div className="rounded-md border bg-background/95 px-3 py-1.5 text-xs opacity-0 shadow-sm transition group-hover:opacity-100">
                                                    <Expand className="mr-1 inline size-3.5"/>
                                                    {t("sponsorPreview")}
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardContent className="flex items-center gap-3 px-6 py-5 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0 text-unread"/>
                    <span>{t("sponsorThanksStatic")}</span>
                </CardContent>
            </Card>

            <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewKey(null)}>
                <DialogContent className="max-w-[28rem]">
                    <DialogHeader>
                        <DialogTitle>{previewItem ? t(previewItem.titleKey) : ""}</DialogTitle>
                        <DialogDescription>{t("sponsorPreviewDesc")}</DialogDescription>
                    </DialogHeader>
                    {previewItem ? (
                        <div className="flex justify-center">
                            <Image
                                src={previewItem.src}
                                alt={t(previewItem.titleKey)}
                                width={420}
                                height={420}
                                unoptimized
                                className="aspect-square w-full max-w-[22rem] rounded-xl border bg-white object-contain p-5"
                            />
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
