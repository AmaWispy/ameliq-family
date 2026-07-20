export const TASK_COLORS = [
    {
        value: 'red',
        label: 'Красный',
        hex: '#ef4444',
        softHex: '#fef2f2',
        borderHex: '#fca5a5',
        swatch: 'bg-red-500',
        card: 'border-red-300 bg-red-50',
        dot: 'bg-red-500',
    },
    {
        value: 'blue',
        label: 'Голубой',
        hex: '#0ea5e9',
        softHex: '#f0f9ff',
        borderHex: '#7dd3fc',
        swatch: 'bg-sky-500',
        card: 'border-sky-300 bg-sky-50',
        dot: 'bg-sky-500',
    },
    {
        value: 'yellow',
        label: 'Жёлтый',
        hex: '#facc15',
        softHex: '#fefce8',
        borderHex: '#fde047',
        swatch: 'bg-yellow-400',
        card: 'border-yellow-300 bg-yellow-50',
        dot: 'bg-yellow-400',
    },
    {
        value: 'purple',
        label: 'Фиолетовый',
        hex: '#a855f7',
        softHex: '#faf5ff',
        borderHex: '#d8b4fe',
        swatch: 'bg-purple-500',
        card: 'border-purple-300 bg-purple-50',
        dot: 'bg-purple-500',
    },
];

export function taskColorMeta(color) {
    return TASK_COLORS.find((item) => item.value === color) ?? null;
}

export function taskCardClass(task) {
    const colorMeta = taskColorMeta(task.color);
    if (colorMeta) {
        return colorMeta.card;
    }
    if (task.is_heavy) {
        return 'border-orange-300 bg-orange-50/60';
    }
    return '';
}

export function taskCardStyle(task) {
    const colorMeta = taskColorMeta(task.color);
    if (!colorMeta) {
        return undefined;
    }

    return {
        backgroundColor: colorMeta.softHex,
        borderColor: colorMeta.borderHex,
    };
}
