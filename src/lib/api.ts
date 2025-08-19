import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Unwrapping data from responses
export const get = <T>(url: string) => api.get<T>(url).then((r) => r.data);
export const post = <TReq, TRes>(url: string, body: TReq) =>
    api.post<TRes>(url, body).then((r) => r.data);
export const patch = <TReq, TRes>(url: string, body: TReq) =>
    api.patch<TRes>(url, body).then((r) => r.data);
export const del = (url: string) => api.delete(url).then((r) => r.status);
