/**
 * Форматирует ввод в маску ЧЧ:ММ (только цифры, максимум 4).
 * Минуты :00 дописываются при потере фокуса / отправке, а не во время ввода.
 */
export function formatTimeInput(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Дописывает минуты :00 и ведущий ноль часов, если пользователь оставил поле неполным. */
export function completeTimeInput(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 4);

    if (digits.length === 0) {
        return '';
    }

    const hours = digits.slice(0, 2).padStart(2, '0');
    const minutes = `${digits.slice(2)}00`.slice(0, 2);

    return `${hours}:${minutes}`;
}
