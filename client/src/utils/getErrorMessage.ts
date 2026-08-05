import { isAxiosError } from "axios";

export function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong. Please try again."
): string {
    if (isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.message) {
            return data.message as string;
        }

        if (Array.isArray(data?.errors) && data.errors.length > 0) {
            return data.errors
                .map((issue: { message: string }) => issue.message)
                .join(" ");
        }
    }

    return fallback;
}
