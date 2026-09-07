/** Объёмы двигателя от 0.7 до 8.0 с шагом 0.1 */
export const ENGINE_VOLUME_OPTIONS: string[] = Array.from({ length: 74 }, (_, index) =>
    ((7 + index) / 10).toFixed(1),
);
