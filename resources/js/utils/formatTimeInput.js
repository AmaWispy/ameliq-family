/**
 * Форматирует ввод в маску ЧЧ:ММ (только цифры, максимум 4).
 */
export function formatTimeInput(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
        return digits;
    }
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
