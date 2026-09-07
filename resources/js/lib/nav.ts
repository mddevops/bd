/** Активен ли пункт меню для текущего URL (включая вложенные страницы). */
export function isNavItemActive(itemUrl: string, currentUrl: string): boolean {
    const pathname = currentUrl.split('?')[0];

    if (pathname === itemUrl) {
        return true;
    }

    return pathname.startsWith(`${itemUrl}/`);
}
