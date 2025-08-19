export type ApiErrorJson = {
    error: string;
    validation_errors?: Record<string, string>;
    details?: unknown;
};

export function extractMessage(e: unknown): string {
    interface ErrorWithResponse {
        message?: string;
        response?: {
            data?: ApiErrorJson;
        };
    }

    const error = e as ErrorWithResponse;
    const msg =
        error?.response?.data?.error ?? error?.message ?? 'Request failed';
    return String(msg);
}
