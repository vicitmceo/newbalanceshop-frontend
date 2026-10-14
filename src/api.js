// На сайті запити йдуть на той самий домен (/api/...), а Vercel проксує їх на сервер.
// Так сесійна кука стає «рідною» для сайту й не блокується браузером як стороння.
export const API_BASE_URL = '';

// Пряма адреса сервера: потрібна лише для переходу на GitHub OAuth (повноцінна навігація, не fetch).
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://newbalanceshop-api.onrender.com';

// Помилка запиту: status — HTTP-код (0 — мережа недоступна), message — текст від сервера, якщо він є.
export class ApiError extends Error {
    constructor(status, message) {
        super(message || String(status));
        this.status = status;
    }
}

async function readError(response) {
    try {
        const data = await response.json();
        if (typeof data?.error === 'string') return data.error;
        if (typeof data?.title === 'string') return data.title;
    } catch {
        // тіло не JSON: достатньо коду статусу
    }
    return '';
}

export async function api(path, { method = 'GET', body, lang } = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            credentials: 'include',
            headers: {
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(lang ? { 'Accept-Language': lang } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, '');
    }

    if (!response.ok) throw new ApiError(response.status, await readError(response));
    if (response.status === 204) return null;
    return response.json();
}

// Шлях до зображення: відносні /images/... лежать на самому фронтенді, повні URL лишаються як є.
export function imageSrc(imageUrl) {
    return imageUrl || '';
}
