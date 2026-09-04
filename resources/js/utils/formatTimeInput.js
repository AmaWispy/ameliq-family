/**
 * Форматирует ввод в маску ЧЧ:ММ.
 * После двух цифр часов подставляет :00, минуты можно дописать.
 */
export function formatTimeInput(raw, previous = '') {
    let digits = String(raw ?? '').replace(/\D/g, '');
    const prevDigits = String(previous ?? '').replace(/\D/g, '');

    if (digits.length > 4 && prevDigits.length === 4 && prevDigits.slice(2) === '00') {
        digits = prevDigits.slice(0, 2) + digits.slice(4);
    }

    digits = digits.slice(0, 4);

    if (digits.length === 0) {
        return '';
    }

    if (digits.length === 1) {
        return digits;
    }

    if (digits.length === 2) {
        if (prevDigits.length >= 3 && prevDigits.length > digits.length) {
            return `${digits}:`;
        }

        return `${digits}:00`;
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
