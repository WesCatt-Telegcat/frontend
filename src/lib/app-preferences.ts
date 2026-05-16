export type Locale = "zh" | "en";
export type ThemeMode = "light" | "dark";
export type LocalePreferenceMode = "auto" | "manual";
export type ThemePreferenceMode = "system" | "manual";

export type AppPreferencesInitialState = {
    locale: Locale;
    theme: ThemeMode;
    localeMode: LocalePreferenceMode;
    themeMode: ThemePreferenceMode;
    accentColor: string;
    accentTextColor: string;
    customAccentColors: string[];
    customAccentTextColors: string[];
};

export const accentPresets = [
    {name: "Blue", value: "oklch(0.58 0.18 252)"},
    {name: "Red", value: "oklch(0.58 0.2 25)"},
    {name: "Green", value: "oklch(0.58 0.16 150)"},
    {name: "Orange", value: "oklch(0.66 0.17 58)"},
    {name: "Pink", value: "oklch(0.62 0.19 350)"},
] as const;

export const accentTextColorPresets = [
    {name: "White", value: "oklch(0.985 0 0)"},
    {name: "Blue Tint", value: "oklch(0.93 0.05 252)"},
    {name: "Red Tint", value: "oklch(0.93 0.05 25)"},
    {name: "Green Tint", value: "oklch(0.94 0.04 150)"},
    {name: "Orange Tint", value: "oklch(0.95 0.05 58)"},
    {name: "Pink Tint", value: "oklch(0.94 0.05 350)"},
] as const;

export const preferenceCookieNames = {
    locale: "telecat_locale",
    localeMode: "telecat_locale_mode",
    theme: "telecat_theme",
    themeMode: "telecat_theme_mode",
    accentColor: "telecat_accent_color",
    accentTextColor: "telecat_accent_text_color",
    customAccentColors: "telecat_custom_accent_colors",
    customAccentTextColors: "telecat_custom_accent_text_colors",
} as const;

export const defaultAppPreferences: AppPreferencesInitialState = {
    locale: "zh",
    theme: "light",
    localeMode: "auto",
    themeMode: "system",
    accentColor: accentPresets[0].value,
    accentTextColor: accentTextColorPresets[0].value,
    customAccentColors: [],
    customAccentTextColors: [],
};

function normalizeLocale(value?: string | null): Locale {
    return value === "en" ? "en" : "zh";
}

function normalizeTheme(value?: string | null): ThemeMode {
    return value === "dark" ? "dark" : "light";
}

function normalizeLocaleMode(value?: string | null): LocalePreferenceMode {
    return value === "manual" ? "manual" : "auto";
}

function normalizeThemeMode(value?: string | null): ThemePreferenceMode {
    return value === "manual" ? "manual" : "system";
}

function normalizeAccentColor(value?: string | null): string {
    if (!value) {
        return defaultAppPreferences.accentColor;
    }

    const normalizedValue = value.trim();

    return normalizedValue || defaultAppPreferences.accentColor;
}

function normalizeAccentTextColor(value?: string | null): string {
    if (!value) {
        return defaultAppPreferences.accentTextColor;
    }

    const normalizedValue = value.trim();

    return normalizedValue || defaultAppPreferences.accentTextColor;
}

function normalizeCustomAccentColors(value?: string | null): string[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as unknown;

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (item): item is string =>
                typeof item === "string" && item.trim().length > 0
        );
    } catch {
        return [];
    }
}

export function buildInitialAppPreferences(values: {
    locale?: string | null;
    localeMode?: string | null;
    fallbackLocale?: Locale;
    theme?: string | null;
    themeMode?: string | null;
    accentColor?: string | null;
    accentTextColor?: string | null;
    customAccentColors?: string | null;
    customAccentTextColors?: string | null;
}): AppPreferencesInitialState {
    const localeMode = normalizeLocaleMode(values.localeMode);
    const themeMode = normalizeThemeMode(values.themeMode);

    return {
        locale:
            localeMode === "manual"
                ? normalizeLocale(values.locale)
                : values.fallbackLocale ?? defaultAppPreferences.locale,
        theme: normalizeTheme(values.theme),
        localeMode,
        themeMode,
        accentColor: normalizeAccentColor(values.accentColor),
        accentTextColor: normalizeAccentTextColor(values.accentTextColor),
        customAccentColors: normalizeCustomAccentColors(values.customAccentColors),
        customAccentTextColors: normalizeCustomAccentColors(values.customAccentTextColors),
    };
}

const zhCountries = new Set(["CN", "HK", "MO", "TW"]);

export function resolveLocaleFromHeaders(headers: Record<string, string | null | undefined>): Locale {
    const countryHeader =
        headers["x-vercel-ip-country"] ??
        headers["cf-ipcountry"] ??
        headers["cloudfront-viewer-country"] ??
        headers["x-country-code"] ??
        headers["x-country"];

    if (countryHeader && zhCountries.has(countryHeader.toUpperCase())) {
        return "zh";
    }

    const acceptLanguage = headers["accept-language"]?.toLowerCase() ?? "";

    return acceptLanguage.includes("zh") ? "zh" : "en";
}
