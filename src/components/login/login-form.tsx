import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import Link from "next/link";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">登录您的帐户</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        在下面输入您的电子邮件以登录您的帐户
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">邮箱</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" required/>
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">密码</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            忘记密码？
                        </a>
                    </div>
                    <Input id="password" type="password" required/>
                </Field>
                <Field>
                    <Button type="submit">登录</Button>
                    <Link href={'/register'} className={"text-end underline text-gray-500 text-[14px]"}>还没有账号？点我去注册</Link>
                </Field>
            </FieldGroup>
        </form>
    )
}
