import type {Locale} from "@/lib/app-preferences";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const DIVIDER_INTERVAL = 5 * MINUTE;

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatTime(date: Date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function shouldShowMessageTimeDivider(current: string, previous?: string) {
    if (!previous) {
        return true;
    }

    return new Date(current).getTime() - new Date(previous).getTime() >= DIVIDER_INTERVAL;
}

export function formatMessageTimeDivider(
    value: string,
    locale: Locale,
    labels: {
        today: string;
        yesterday: string;
    }
) {
    const date = new Date(value);
    const now = new Date();
    const dayDiff = Math.floor(
        (startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY
    );
    const time = formatTime(date);

    if (locale === "zh") {
        if (dayDiff === 0) {
            return `${labels.today} ${time}`;
        }

        if (dayDiff === 1) {
            return `${labels.yesterday} ${time}`;
        }

        if (dayDiff > 1 && dayDiff < 7) {
            return `${new Intl.DateTimeFormat("zh-CN", {weekday: "short"}).format(date)} ${time}`;
        }

        if (date.getFullYear() === now.getFullYear()) {
            return `${new Intl.DateTimeFormat("zh-CN", {
                month: "numeric",
                day: "numeric",
            }).format(date)} ${time}`;
        }

        return `${new Intl.DateTimeFormat("zh-CN", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }).format(date)} ${time}`;
    }

    if (dayDiff === 0) {
        return `${labels.today} ${time}`;
    }

    if (dayDiff === 1) {
        return `${labels.yesterday} ${time}`;
    }

    if (dayDiff > 1 && dayDiff < 7) {
        return `${new Intl.DateTimeFormat("en-US", {weekday: "long"}).format(date)} ${time}`;
    }

    if (date.getFullYear() === now.getFullYear()) {
        return `${new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(date)} ${time}`;
    }

    return `${new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date)} ${time}`;
}
