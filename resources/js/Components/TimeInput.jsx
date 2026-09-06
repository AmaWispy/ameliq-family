import { useEffect, useRef } from 'react';
import { completeTimeInput, formatTimeInput } from '@/utils/formatTimeInput';

const COMPLETE_TIME = /^\d{2}:\d{2}$/;

function nextDigitPosition(pos) {
    let next = pos + 1;
    if (next === 2) {
        next = 3;
    }

    return Math.min(next, 5);
}

function overwriteDigit(value, cursor, digit) {
    let pos = cursor;
    if (pos === 2) {
        pos = 3;
    }
    if (pos >= 5) {
        pos = 0;
    }
    if (pos < 0) {
        pos = 0;
    }

    const chars = value.split('');
    chars[pos] = digit;

    return {
        value: chars.join(''),
        nextPos: nextDigitPosition(pos),
    };
}

export default function TimeInput({ id, value, onChange, className = '' }) {
    const inputRef = useRef(null);
    const caretRef = useRef(null);

    useEffect(() => {
        if (caretRef.current === null || !inputRef.current) {
            return;
        }

        inputRef.current.setSelectionRange(caretRef.current, caretRef.current);
        caretRef.current = null;
    }, [value]);

    const handleKeyDown = (event) => {
        if (!/^\d$/.test(event.key) || !COMPLETE_TIME.test(value ?? '')) {
            return;
        }

        event.preventDefault();

        const start = event.target.selectionStart ?? 0;
        const end = event.target.selectionEnd ?? start;
        const cursor = end - start === (value?.length ?? 0) ? 0 : start;
        const next = overwriteDigit(value, cursor, event.key);

        caretRef.current = next.nextPos;
        onChange(next.value);
    };

    return (
        <input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00:00"
            maxLength={5}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                className
            }
            value={value}
            onKeyDown={handleKeyDown}
            onChange={(event) => onChange(formatTimeInput(event.target.value))}
            onBlur={(event) => onChange(completeTimeInput(event.target.value))}
        />
    );
}
