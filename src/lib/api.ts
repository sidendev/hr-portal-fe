import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const get = <T>(url: string) => api.get<T>(url).then((r) => r.data);
export const post = <TReq, TRes>(url: string, body: TReq) =>
    api.post<TRes>(url, body).then((r) => r.data);
export const patch = <TReq, TRes>(url: string, body: TReq) =>
    api.patch<TRes>(url, body).then((r) => r.data);
export const del = (url: string) => api.delete(url).then((r) => r.status);

import type { Employee } from '../types';

export interface EmployeeFilters {
    q?: string;
    contractType?: 'full-time' | 'part-time';
    expiring?: 'current-month';
    page?: number;
    size?: number;
}

export function getEmployeesWithFilters(filters: EmployeeFilters = {}) {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.contractType)
        params.append('contractType', filters.contractType);
    if (filters.expiring) params.append('expiring', filters.expiring);
    if (filters.page !== undefined)
        params.append('page', filters.page.toString());
    if (filters.size !== undefined)
        params.append('size', filters.size.toString());

    const queryString = params.toString();
    const url = queryString ? `/employees?${queryString}` : '/employees';

    return get<Employee[]>(url);
}
