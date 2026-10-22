const DEVICE_ID_KEY = "authDeviceId";
let inMemoryDeviceId: string | null = null;

function createDeviceId(): string {
    return window.crypto.randomUUID();
}

export function getDeviceId(): string {
    try {
        const storedId = window.localStorage.getItem(DEVICE_ID_KEY);
        if (storedId && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(storedId)) {
            return storedId;
        }

        const deviceId = createDeviceId();
        window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
        return deviceId;
    } catch {
        // Keep auth usable when browser storage is disabled.
        inMemoryDeviceId ??= createDeviceId();
        return inMemoryDeviceId;
    }
}
