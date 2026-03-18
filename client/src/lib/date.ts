import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/** Call once when locale changes to keep dayjs in sync. */
export function setDateLocale(locale: 'en' | 'ar'): void {
    dayjs.locale(locale);
}

/** Format a date in the current dayjs locale. */
export function formatDate(date: string | Date, format = 'LL'): string {
    return dayjs(date).format(format);
}

/** Relative time (e.g. "3 days ago"). */
export function fromNow(date: string | Date): string {
    return dayjs(date).fromNow();
}

/**
 * Format a number using western digits (0-9) regardless of display locale.
 * Per OQ-4 decision: always use western numerals; Arabic words, western digits.
 * Override via VITE_NUMERAL_LOCALE env var for eastern-Arabic digit preference.
 */
const _numeralLocale = (import.meta as any).env?.VITE_NUMERAL_LOCALE ?? 'en-US-u-nu-latn';

export function formatNumber(
    value: number,
    opts: Intl.NumberFormatOptions = {},
): string {
    return new Intl.NumberFormat(_numeralLocale, opts).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
    return formatNumber(value, { style: 'percent', maximumFractionDigits: decimals });
}

export { dayjs };
