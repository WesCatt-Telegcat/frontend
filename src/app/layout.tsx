import type {Metadata} from "next";
import {cookies} from "next/headers";
import {Noto_Sans_SC, Inter} from "next/font/google";
import type {CSSProperties} from "react";
import "./globals.css";
import {cn} from "@/lib/utils";
import {AppPreferencesProvider} from "@/components/app/preferences-provider";
import {
    buildInitialAppPreferences,
    preferenceCookieNames,
} from "@/lib/app-preferences";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


const notoSansSC = Noto_Sans_SC({
    variable: "--font-noto_sans_sc",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Telegcat",
    description: "Telegcat-working...",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const initialPreferences = buildInitialAppPreferences({
        locale: cookieStore.get(preferenceCookieNames.locale)?.value,
        theme: cookieStore.get(preferenceCookieNames.theme)?.value,
        accentColor: cookieStore.get(preferenceCookieNames.accentColor)?.value,
        accentTextColor: cookieStore.get(preferenceCookieNames.accentTextColor)?.value,
        customAccentColors: cookieStore.get(preferenceCookieNames.customAccentColors)?.value,
        customAccentTextColors: cookieStore.get(preferenceCookieNames.customAccentTextColors)?.value,
    });

    return (
        <html
            lang={initialPreferences.locale === "zh" ? "zh-CN" : "en"}
            suppressHydrationWarning
            className={cn(
                "font-sans",
                inter.variable,
                initialPreferences.theme === "dark" && "dark"
            )}
            style={{
                "--unread": initialPreferences.accentColor,
                "--unread-foreground": initialPreferences.accentTextColor,
            } as CSSProperties}
        >
        <body
            className={`${notoSansSC.className} antialiased`}
        >
        <AppPreferencesProvider initialPreferences={initialPreferences}>
            {children}
        </AppPreferencesProvider>
        </body>
        </html>
    );
}
