/** Конвертация yyyy-mm-dd (input type=date) → d.m.Y для Laravel DataTable. */
export function dateInputToBackend(value: string): string {
    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    return `${day}.${month}.${year}`;
}

/** Конвертация d.m.Y / d-m-Y с бэкенда → yyyy-mm-dd для input type=date. */
export function dateBackendToInput(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const parts = value.includes('.') ? value.split('.') : value.split('-');

    if (parts.length !== 3) {
        return null;
    }

    const [day, month, year] = parts;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/** Человекочитаемый формат для тега фильтра. */
export function formatDateLabel(value: string | null | undefined): string {
    const input = dateBackendToInput(value);

    if (!input) {
        return value ?? '';
    }

    const [year, month, day] = input.split('-');

    return `${day}.${month}.${year}`;
}

export function backendToDate(value: string | null | undefined): Date | undefined {
    const input = dateBackendToInput(value);

    if (!input) {
        return undefined;
    }

    const [year, month, day] = input.split('-').map(Number);

    return new Date(year, month - 1, day);
}

export function dateToBackend(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}
