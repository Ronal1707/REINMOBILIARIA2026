const API_TOKEN = "6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861";
const AUTH_HEADER = "Basic " + btoa(":" + API_TOKEN);
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

function leerCache(cacheKey) {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL_MS) return data;
        localStorage.removeItem(cacheKey);
    } catch (_) { /* localStorage no disponible o JSON inválido */ }
    return null;
}

function escribirCache(cacheKey, data) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
    } catch (_) { /* quota excedida, ignorar */ }
}

export async function apiGet(endpoint) {
    const url = `https://simi-api.com/${endpoint}`;
    const cacheKey = `api_cache_${endpoint}`;

    const cached = leerCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(url, {
        method: "GET",
        headers: { "Authorization": AUTH_HEADER }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    escribirCache(cacheKey, data);

    return data;
}
