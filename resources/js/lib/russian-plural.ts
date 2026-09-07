/**
 * Склонение существительного по числу: 1 марка, 2 марки, 5 марок.
 * forms: [one, few, many] — для 1, 2–4, 5+
 */
export function formatRussianCount(count: number, forms: [string, string, string]): string {
    const n = Math.abs(count) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) {
        return `${count} ${forms[2]}`;
    }

    if (n1 > 1 && n1 < 5) {
        return `${count} ${forms[1]}`;
    }

    if (n1 === 1) {
        return `${count} ${forms[0]}`;
    }

    return `${count} ${forms[2]}`;
}
