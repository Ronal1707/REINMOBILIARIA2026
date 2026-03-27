const API_TOKEN = "6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861";
const AUTH_HEADER = "Basic " + btoa(":" + API_TOKEN);

export async function apiGet(endpoint) {
    const url = `https://simi-api.com/${endpoint}`;

    const res = await fetch(url, {
        method: "GET",
        headers: { "Authorization": AUTH_HEADER }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return await res.json();
}
