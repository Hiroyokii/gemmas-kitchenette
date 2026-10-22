import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const DEVICE_ID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

const createAuthRateLimiter = () => rateLimit({
    // Keep the lockout short so legitimate users can retry soon.
    windowMs: 60 * 1000,
    limit: 10,
    keyGenerator: (req) => {
        const deviceId = req.get("x-device-id")?.trim();
        return deviceId && DEVICE_ID_PATTERN.test(deviceId)
            ? `device:${deviceId.toLowerCase()}`
            : ipKeyGenerator(req.ip ?? "127.0.0.1");
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many attempts. Please try again later.",
    }
});

// Login and registration have independent counters so one flow does not lock
// out the other for the same visitor.
export const loginRateLimiter = createAuthRateLimiter();
export const registerRateLimiter = createAuthRateLimiter();
