/**
 * Безопасный вызов Ziggy route(): при отсутствии имени маршрута
 * возвращает null вместо падения всего экрана.
 */
export function safeRoute(name: string, params?: unknown, absolute?: boolean): string | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (route as any)(name, params, absolute) as string;
    } catch {
        return null;
    }
}
