const ACCESS_TOKEN_KEY = "accessToken";
let accessToken: string | null = null;

export function getAccessToken(): string | null {
    if (accessToken) {
        return accessToken;
    }

    try {
        accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        // Keep the in-memory token usable when browser storage is unavailable.
    }

    return accessToken;
}

export function setAccessToken(token: string): void {
    accessToken = token;

    try {
        window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
        // Authentication can still work in memory for the current page.
    }
}

export function clearAccessToken(): void {
    accessToken = null;

    try {
        window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
        // Ignore unavailable browser storage.
    }
}
