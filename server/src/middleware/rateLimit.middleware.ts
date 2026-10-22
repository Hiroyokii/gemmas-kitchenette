import rateLimit from "express-rate-limit";

const createAuthRateLimiter = () => rateLimit({
    // Keep the lockout short so legitimate users can retry soon.
    windowMs: 60 * 1000,
    limit: 10,
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
