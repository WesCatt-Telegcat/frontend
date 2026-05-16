"use client"

import {BreadcrumbItem, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {usePathname} from "next/navigation";
import {useAppTranslations} from "@/i18n/use-app-translations";

export function LoggedShellTitle() {
    const t = useAppTranslations();
    const pathname = usePathname();
    const title = pathname === "/settings"
        ? t("settings")
        : pathname === "/notification"
            ? t("notification")
            : pathname === "/sponsor"
                ? t("sponsor")
                : t("workspace");

    return (
        <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
    )
}
