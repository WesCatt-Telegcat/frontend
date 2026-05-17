"use client"

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {FieldErrorLine} from "@/components/form/field-error-line";
import {authApi, tokenStore} from "@/lib/api";
import {bootstrapEncryptionAfterLogin} from "@/lib/e2ee";
import {cn} from "@/lib/utils";
import {useAppTranslations} from "@/i18n/use-app-translations";

type LoginErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const router = useRouter();
    const t = useAppTranslations();
    const [errors, setErrors] = useState<LoginErrors>({});
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const nextErrors: LoginErrors = {};

        if (!email) {
            nextErrors.email = t("emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = t("emailInvalid");
        }

        if (!password) {
            nextErrors.password = t("passwordRequired");
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }

        setPending(true);
        try {
            const response = await authApi.login({email, password});

            tokenStore.set(response.token);
            const syncPayload = await bootstrapEncryptionAfterLogin(response.user, password);
            const sessionUser = syncPayload
                ? await authApi.syncEncryptionKey(syncPayload)
                : response.user;

            window.localStorage.setItem("telecat_user", JSON.stringify(sessionUser));
            router.replace("/");
        } catch (err) {
            tokenStore.clear();
            setErrors({
                password: err instanceof Error ? err.message : t("passwordRequired"),
            });
        } finally {
            setPending(false);
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} noValidate {...props}>
            <FieldGroup className="gap-4">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {t("loginDesc")}
                    </p>
                </div>
                <Field className="gap-2" data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        aria-invalid={Boolean(errors.email)}
                    />
                    <FieldErrorLine message={errors.email}/>
                </Field>
                <Field className="gap-2" data-invalid={Boolean(errors.password)}>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            {t("forgotPassword")}
                        </a>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        aria-invalid={Boolean(errors.password)}
                    />
                    <FieldErrorLine message={errors.password}/>
                </Field>
                <Field>
                    <Button type="submit" disabled={pending}>{pending ? t("loggingIn") : t("login")}</Button>
                    <Link href="/register" className="text-end text-[14px] text-muted-foreground underline">{t("goRegister")}</Link>
                </Field>
            </FieldGroup>
        </form>
    )
}
