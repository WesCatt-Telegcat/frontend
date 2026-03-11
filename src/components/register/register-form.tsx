import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link";

export function SignupForm({
                               className,
                               ...props
                           }: React.ComponentProps<"form">) {
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">注册您的账号</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        填写下面的表单来创建您的帐户
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="name">姓名</FieldLabel>
                    <Input id="name" type="text" placeholder="John Doe" required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">邮箱</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                    <FieldDescription>
                        我们将用它来联系您。我们不会分享您的电子邮件
                        与其他人。
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">密码</FieldLabel>
                    <Input id="password" type="password" required />
                    <FieldDescription>
                        长度必须至少为 8 个字符。
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">重复您的密码</FieldLabel>
                    <Input id="confirm-password" type="password" required />
                    <FieldDescription>请确认您的密码。</FieldDescription>
                </Field>
                <Field>
                    <Button type="submit">注册</Button>
                    <Link href={'/login'} className={"text-end underline text-gray-500 text-[14px]"}>已有账号？点我去登录</Link>

                </Field>
            </FieldGroup>
        </form>
    )
}
