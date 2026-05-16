"use client"

import {useLocale as useNextIntlLocale, useTranslations} from "next-intl";
import type {Locale} from "@/lib/app-preferences";

export function useAppTranslations() {
    return useTranslations("common");
}

export function useAppLocale() {
    return useNextIntlLocale() as Locale;
}
