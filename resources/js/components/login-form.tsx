import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginFormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
    email: string;
    password: string;
    remember: boolean;
    processing: boolean;
    canResetPassword: boolean;
    errors: {
        email?: string;
        password?: string;
    };
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onRememberChange: (checked: boolean) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export function LoginForm({
    className,
    email,
    password,
    remember,
    processing,
    canResetPassword,
    errors,
    onEmailChange,
    onPasswordChange,
    onRememberChange,
    onSubmit,
    ...props
}: LoginFormProps) {
    return (
        <form className={cn('flex flex-col gap-6', className)} onSubmit={onSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
                    <p className="text-sm text-balance text-muted-foreground">Введите email и пароль для входа</p>
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        value={email}
                        onChange={(event) => onEmailChange(event.target.value)}
                        className="bg-background"
                        aria-invalid={!!errors.email}
                    />
                    <InputError message={errors.email} />
                </Field>

                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Пароль</FieldLabel>
                        {canResetPassword ? (
                            <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                Забыли пароль?
                            </TextLink>
                        ) : null}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => onPasswordChange(event.target.value)}
                        className="bg-background"
                        aria-invalid={!!errors.password}
                    />
                    <InputError message={errors.password} />
                </Field>

                <Field>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) => onRememberChange(checked === true)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember" className="font-normal">
                            Запомнить меня
                        </Label>
                    </div>
                </Field>

                <Field>
                    <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                        {processing ? <LoaderCircle className="size-4 animate-spin" /> : null}
                        Войти
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
