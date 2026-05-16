import type {Metadata} from "next";
import {cookies, headers} from "next/headers";
import {Noto_Sans_SC, Inter} from "next/font/google";
import type {CSSProperties} from "react";
import "./globals.css";
import {cn} from "@/lib/utils";
import {AppPreferencesProvider} from "@/components/app/preferences-provider";
import {
    buildInitialAppPreferences,
    preferenceCookieNames,
    resolveLocaleFromHeaders,
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
    const headerStore = await headers();
    const initialPreferences = buildInitialAppPreferences({
        locale: cookieStore.get(preferenceCookieNames.locale)?.value,
        localeMode: cookieStore.get(preferenceCookieNames.localeMode)?.value,
        fallbackLocale: resolveLocaleFromHeaders({
            "accept-language": headerStore.get("accept-language"),
            "cf-ipcountry": headerStore.get("cf-ipcountry"),
            "cloudfront-viewer-country": headerStore.get("cloudfront-viewer-country"),
            "x-country": headerStore.get("x-country"),
            "x-country-code": headerStore.get("x-country-code"),
            "x-vercel-ip-country": headerStore.get("x-vercel-ip-country"),
        }),
        theme: cookieStore.get(preferenceCookieNames.theme)?.value,
        themeMode: cookieStore.get(preferenceCookieNames.themeMode)?.value,
        accentColor: cookieStore.get(preferenceCookieNames.accentColor)?.value,
        accentTextColor: cookieStore.get(preferenceCookieNames.accentTextColor)?.value,
        customAccentColors: cookieStore.get(preferenceCookieNames.customAccentColors)?.value,
        customAccentTextColors: cookieStore.get(preferenceCookieNames.customAccentTextColors)?.value,
    });
    const themeBootstrapScript = `
(() => {
  try {
    const getCookie = (name) => {
      const value = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(name + "="));
      return value ? decodeURIComponent(value.split("=").slice(1).join("=")) : null;
    };
    const mode = getCookie("${preferenceCookieNames.themeMode}");
    const savedTheme = getCookie("${preferenceCookieNames.theme}");
    const resolvedTheme =
      mode === "manual" && (savedTheme === "dark" || savedTheme === "light")
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    window.__telecatResolvedTheme = resolvedTheme;
  } catch {}
})();`;

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
        <head>
            <script dangerouslySetInnerHTML={{__html: themeBootstrapScript}}/>
        </head>
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
