export type Locale = "zh" | "en";
export type ThemeMode = "light" | "dark";

export type AppPreferencesInitialState = {
    locale: Locale;
    theme: ThemeMode;
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
    theme: "telecat_theme",
    accentColor: "telecat_accent_color",
    accentTextColor: "telecat_accent_text_color",
    customAccentColors: "telecat_custom_accent_colors",
    customAccentTextColors: "telecat_custom_accent_text_colors",
} as const;

export const defaultAppPreferences: AppPreferencesInitialState = {
    locale: "zh",
    theme: "light",
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
    theme?: string | null;
    accentColor?: string | null;
    accentTextColor?: string | null;
    customAccentColors?: string | null;
    customAccentTextColors?: string | null;
}): AppPreferencesInitialState {
    return {
        locale: normalizeLocale(values.locale),
        theme: normalizeTheme(values.theme),
        accentColor: normalizeAccentColor(values.accentColor),
        accentTextColor: normalizeAccentTextColor(values.accentTextColor),
        customAccentColors: normalizeCustomAccentColors(values.customAccentColors),
        customAccentTextColors: normalizeCustomAccentColors(values.customAccentTextColors),
    };
}
