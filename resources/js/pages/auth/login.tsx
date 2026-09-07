import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

import AppLogo from '@/components/app-logo';
import { LoginForm } from '@/components/login-form';
import { type SharedData } from '@/types';

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { systemSettings } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors, reset } = useForm<LoginFormData>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Вход" />

            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <div className="flex items-center gap-2 font-medium">
                            <AppLogo />
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            {status ? <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div> : null}

                            <LoginForm
                                email={data.email}
                                password={data.password}
                                remember={data.remember}
                                processing={processing}
                                canResetPassword={canResetPassword}
                                errors={errors}
                                onEmailChange={(value) => setData('email', value)}
                                onPasswordChange={(value) => setData('password', value)}
                                onRememberChange={(checked) => setData('remember', checked)}
                                onSubmit={submit}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative hidden bg-muted lg:block">
                    <img
                        src={systemSettings.loginImageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
            </div>
        </>
    );
}
