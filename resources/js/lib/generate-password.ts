const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+';
const ALL = LOWERCASE + UPPERCASE + DIGITS + SYMBOLS;

function pickRandom(charset: string): string {
    const index = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length;

    return charset[index];
}

function shuffle(values: string[]): string[] {
    const result = [...values];

    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

/** Случайный пароль: 12 символов, буквы, цифры и спецсимволы. */
export function generateStrongPassword(length = 12): string {
    const required = [pickRandom(LOWERCASE), pickRandom(UPPERCASE), pickRandom(DIGITS), pickRandom(SYMBOLS)];
    const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => pickRandom(ALL));

    return shuffle([...required, ...rest]).join('');
}
