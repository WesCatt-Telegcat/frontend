"use client"

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {FieldErrorLine} from "@/components/form/field-error-line";
import {authApi, tokenStore} from "@/lib/api";
import {getOrCreateEncryptionPublicKey} from "@/lib/e2ee";
import {cn} from "@/lib/utils";
import {useAppTranslations} from "@/i18n/use-app-translations";

type RegisterErrors = Partial<
    Record<"name" | "email" | "code" | "password" | "confirmPassword", string>
>;

export function SignupForm({
                               className,
                               ...props
                           }: React.ComponentProps<"form">) {
    const router = useRouter();
    const t = useAppTranslations();
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [notice, setNotice] = useState("");
    const [pending, setPending] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeCooldown, setCodeCooldown] = useState(0);

    useEffect(() => {
        if (codeCooldown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setCodeCooldown((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [codeCooldown]);

    function validateEmail(email: string) {
        if (!email) {
            return t("emailRequired");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return t("emailInvalid");
        }

        return "";
    }

    async function sendCode() {
        const input = document.getElementById("email") as HTMLInputElement | null;
        const email = input?.value.trim() ?? "";
        const emailError = validateEmail(email);

        setNotice("");
        if (emailError) {
            setErrors((current) => ({...current, email: emailError}));
            return;
        }

        setErrors((current) => ({...current, email: ""}));
        setSendingCode(true);
        try {
            const response = await authApi.sendCode(email);
            setNotice(t("codeSent"));
            setCodeCooldown(response.resendIn);
        } catch (err) {
            setErrors((current) => ({
                ...current,
                email: err instanceof Error ? err.message : t("emailInvalid"),
            }));
        } finally {
            setSendingCode(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const code = String(formData.get("code") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirm-password") ?? "");
        const nextErrors: RegisterErrors = {};

        if (!name) {
            nextErrors.name = t("nameRequired");
        }

        const emailError = validateEmail(email);
        if (emailError) {
            nextErrors.email = emailError;
        }

        if (!code) {
            nextErrors.code = t("codeRequired");
        } else if (!/^\d{6}$/.test(code)) {
            nextErrors.code = t("codeInvalid");
        }

        if (!password) {
            nextErrors.password = t("passwordRequired");
        } else if (password.length < 8) {
            nextErrors.password = t("passwordLength");
        }

        if (password !== confirmPassword) {
            nextErrors.confirmPassword = t("confirmPasswordMismatch");
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }

        setPending(true);
        try {
            const encryptionPublicKey = await getOrCreateEncryptionPublicKey(email);
            const response = await authApi.register({name, email, password, code, encryptionPublicKey});

            tokenStore.set(response.token);
            window.localStorage.setItem("telecat_user", JSON.stringify(response.user));
            router.replace("/");
        } catch (err) {
            const message = err instanceof Error ? err.message : t("register");
            setErrors((current) => ({
                ...current,
                [message.includes("验证码") || /code/i.test(message) ? "code" : "email"]: message,
            }));
        } finally {
            setPending(false);
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} noValidate {...props}>
            <FieldGroup className="gap-4">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {t("registerDesc")}
                    </p>
                </div>
                <Field className="gap-2" data-invalid={Boolean(errors.name)}>
                    <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        aria-invalid={Boolean(errors.name)}
                    />
                    <FieldErrorLine message={errors.name}/>
                </Field>
                <Field className="gap-2" data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                    <div className="flex gap-2">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            aria-invalid={Boolean(errors.email)}
                        />
                        <Button type="button" variant="outline" disabled={sendingCode || codeCooldown > 0} onClick={sendCode}>
                            {sendingCode ? t("sendingCode") : codeCooldown > 0 ? `${codeCooldown}s` : t("sendCode")}
                        </Button>
                    </div>
                    <FieldErrorLine message={errors.email}/>
                </Field>
                <Field className="gap-2" data-invalid={Boolean(errors.code)}>
                    <FieldLabel htmlFor="code">{t("code")}</FieldLabel>
                    <Input
                        id="code"
                        name="code"
                        inputMode="numeric"
                        maxLength={6}
                        aria-invalid={Boolean(errors.code)}
                    />
                    <FieldErrorLine message={errors.code}/>
                    <FieldDescription className="min-h-4 text-xs leading-4">
                        {notice ? notice : <span className="invisible">.</span>}
                    </FieldDescription>
                </Field>
                <Field className="gap-2" data-invalid={Boolean(errors.password)}>
                    <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        aria-invalid={Boolean(errors.password)}
                    />
                    <FieldErrorLine message={errors.password}/>
                    <FieldDescription className="text-xs leading-4">{t("passwordDesc")}</FieldDescription>
                </Field>
                <Field className="gap-2" data-invalid={Boolean(errors.confirmPassword)}>
                    <FieldLabel htmlFor="confirm-password">{t("confirmPassword")}</FieldLabel>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        aria-invalid={Boolean(errors.confirmPassword)}
                    />
                    <FieldErrorLine message={errors.confirmPassword}/>
                </Field>
                <Field>
                    <Button type="submit" disabled={pending}>{pending ? t("registering") : t("register")}</Button>
                    <Link href="/login" className="text-end text-[14px] text-muted-foreground underline">{t("goLogin")}</Link>
                </Field>
            </FieldGroup>
        </form>
    )
}
