"use client"

import {QrCode, ShieldCheck, Sparkles, Wallet} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {useAppTranslations} from "@/i18n/use-app-translations";

const sponsorMethods = [
    {
        key: "alipay",
        color: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    },
    {
        key: "wechat",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
] as const;

export function SponsorPanel() {
    const t = useAppTranslations();

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
            <Card>
                <CardHeader className="gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="size-4"/>
                        {t("sponsor")}
                    </div>
                    <CardTitle className="text-2xl">{t("sponsorTitle")}</CardTitle>
                    <CardDescription>{t("sponsorDesc")}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {sponsorMethods.map((method) => (
                    <Card key={method.key} className="overflow-hidden">
                        <CardHeader className="gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`flex size-11 items-center justify-center rounded-lg ${method.color}`}>
                                        <Wallet className="size-5"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {method.key === "alipay"
                                                ? t("sponsorMethodAlipay")
                                                : t("sponsorMethodWechat")}
                                        </CardTitle>
                                        <CardDescription>{t("sponsorMethodQr")}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline">{t("sponsorStatusPending")}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/30">
                                <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
                                    <div className="flex size-14 items-center justify-center rounded-lg bg-background shadow-sm">
                                        <QrCode className="size-7"/>
                                    </div>
                                    <div>{t("sponsorMethodNote")}</div>
                                </div>
                            </div>
                            <Button type="button" disabled className="bg-unread text-unread-foreground hover:bg-unread/90">
                                {t("sponsorActionPending")}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="flex items-center gap-3 px-6 py-5 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0 text-unread"/>
                    <span>{t("sponsorThanks")}</span>
                </CardContent>
            </Card>
        </div>
    );
}
