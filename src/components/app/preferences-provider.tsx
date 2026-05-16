"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {NextIntlClientProvider} from "next-intl";
import {
    accentPresets,
    accentTextColorPresets,
    type AppPreferencesInitialState,
    type Locale,
    preferenceCookieNames,
    type ThemeMode,
} from "@/lib/app-preferences";
import {appMessages} from "@/i18n/messages";

type AppPreferencesValue = {
    locale: Locale;
    theme: ThemeMode;
    accentColor: string;
    accentTextColor: string;
    customAccentColors: string[];
    customAccentTextColors: string[];
    toggleLocale: () => void;
    toggleTheme: () => void;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: ThemeMode) => void;
    setAccentColor: (color: string) => void;
    setAccentTextColor: (color: string) => void;
    addCustomAccentColor: (color: string) => void;
    updateCustomAccentColor: (index: number, color: string) => void;
    removeCustomAccentColor: (index: number) => void;
    addCustomAccentTextColor: (color: string) => void;
    updateCustomAccentTextColor: (index: number, color: string) => void;
    removeCustomAccentTextColor: (index: number) => void;
};

const AppPreferencesContext = createContext<AppPreferencesValue | null>(null);

function setPreferenceCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function AppPreferencesProvider({
    children,
    initialPreferences,
}: {
    children: React.ReactNode
    initialPreferences: AppPreferencesInitialState
}) {
    const [locale, setLocaleState] = useState<Locale>(initialPreferences.locale);
    const [theme, setThemeState] = useState<ThemeMode>(initialPreferences.theme);
    const [accentColor, setAccentColorState] = useState<string>(initialPreferences.accentColor);
    const [accentTextColor, setAccentTextColorState] = useState<string>(
        initialPreferences.accentTextColor
    );
    const [customAccentColors, setCustomAccentColors] = useState<string[]>(
        initialPreferences.customAccentColors
    );
    const [customAccentTextColors, setCustomAccentTextColors] = useState<string[]>(
        initialPreferences.customAccentTextColors
    );

    useEffect(() => {
        document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
        window.localStorage.setItem(preferenceCookieNames.locale, locale);
        setPreferenceCookie(preferenceCookieNames.locale, locale);
    }, [locale]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        window.localStorage.setItem(preferenceCookieNames.theme, theme);
        setPreferenceCookie(preferenceCookieNames.theme, theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.style.setProperty("--unread", accentColor);
        window.localStorage.setItem(preferenceCookieNames.accentColor, accentColor);
        setPreferenceCookie(preferenceCookieNames.accentColor, accentColor);
    }, [accentColor]);

    useEffect(() => {
        document.documentElement.style.setProperty("--unread-foreground", accentTextColor);
        window.localStorage.setItem(preferenceCookieNames.accentTextColor, accentTextColor);
        setPreferenceCookie(preferenceCookieNames.accentTextColor, accentTextColor);
    }, [accentTextColor]);

    useEffect(() => {
        const value = JSON.stringify(customAccentColors);

        window.localStorage.setItem(
            preferenceCookieNames.customAccentColors,
            value
        );
        setPreferenceCookie(preferenceCookieNames.customAccentColors, value);
    }, [customAccentColors]);

    useEffect(() => {
        const value = JSON.stringify(customAccentTextColors);

        window.localStorage.setItem(
            preferenceCookieNames.customAccentTextColors,
            value
        );
        setPreferenceCookie(preferenceCookieNames.customAccentTextColors, value);
    }, [customAccentTextColors]);

    const toggleLocale = useCallback(() => {
        setLocaleState((current) => (current === "zh" ? "en" : "zh"));
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) => (current === "light" ? "dark" : "light"));
    }, []);

    const setLocale = useCallback((nextLocale: Locale) => {
        setLocaleState(nextLocale);
    }, []);

    const setTheme = useCallback((nextTheme: ThemeMode) => {
        setThemeState(nextTheme);
    }, []);

    const setAccentColor = useCallback((color: string) => {
        setAccentColorState(color);
    }, []);

    const setAccentTextColor = useCallback((color: string) => {
        setAccentTextColorState(color);
    }, []);

    const addCustomAccentColor = useCallback((color: string) => {
        setCustomAccentColors((current) =>
            current.includes(color) ? current : [...current, color]
        );
        setAccentColorState(color);
    }, []);

    const updateCustomAccentColor = useCallback((index: number, color: string) => {
        setCustomAccentColors((current) =>
            current.map((currentColor, currentIndex) =>
                currentIndex === index ? color : currentColor
            )
        );
        setAccentColorState(color);
    }, []);

    const removeCustomAccentColor = useCallback((index: number) => {
        setCustomAccentColors((current) => {
            const removedColor = current[index];
            const nextColors = current.filter((_, currentIndex) => currentIndex !== index);

            setAccentColorState((currentAccent) =>
                currentAccent === removedColor ? accentPresets[0].value : currentAccent
            );

            return nextColors;
        });
    }, []);

    const addCustomAccentTextColor = useCallback((color: string) => {
        setCustomAccentTextColors((current) =>
            current.includes(color) ? current : [...current, color]
        );
        setAccentTextColorState(color);
    }, []);

    const updateCustomAccentTextColor = useCallback((index: number, color: string) => {
        setCustomAccentTextColors((current) =>
            current.map((currentColor, currentIndex) =>
                currentIndex === index ? color : currentColor
            )
        );
        setAccentTextColorState(color);
    }, []);

    const removeCustomAccentTextColor = useCallback((index: number) => {
        setCustomAccentTextColors((current) => {
            const removedColor = current[index];
            const nextColors = current.filter((_, currentIndex) => currentIndex !== index);

            setAccentTextColorState((currentTextColor) =>
                currentTextColor === removedColor
                    ? accentTextColorPresets[0].value
                    : currentTextColor
            );

            return nextColors;
        });
    }, []);

    const value = useMemo(
        () => ({
            locale,
            theme,
            accentColor,
            accentTextColor,
            customAccentColors,
            customAccentTextColors,
            toggleLocale,
            toggleTheme,
            setLocale,
            setTheme,
            setAccentColor,
            setAccentTextColor,
            addCustomAccentColor,
            updateCustomAccentColor,
            removeCustomAccentColor,
            addCustomAccentTextColor,
            updateCustomAccentTextColor,
            removeCustomAccentTextColor,
        }),
        [
            accentColor,
            accentTextColor,
            addCustomAccentColor,
            addCustomAccentTextColor,
            customAccentColors,
            customAccentTextColors,
            locale,
            removeCustomAccentTextColor,
            setAccentColor,
            setAccentTextColor,
            setLocale,
            setTheme,
            theme,
            toggleLocale,
            toggleTheme,
            updateCustomAccentColor,
            updateCustomAccentTextColor,
            removeCustomAccentColor,
        ]
    );

    return (
        <NextIntlClientProvider locale={locale} messages={appMessages[locale]}>
            <AppPreferencesContext.Provider value={value}>
                {children}
            </AppPreferencesContext.Provider>
        </NextIntlClientProvider>
    );
}

export function useAppPreferences() {
    const context = useContext(AppPreferencesContext);

    if (!context) {
        throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
    }

    return context;
}
