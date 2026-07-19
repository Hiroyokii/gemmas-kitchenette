import request from "supertest";
import app from "../src/app.ts";
import { describe, it, expect } from "vitest";

describe("Authentication", () => {
    it("should reject invalid login", async () => {
        const response =
            await request(app)
                .post("auth/login")
                .send({
                    email: "wrong@test.com",
                    password: "123456",
                });

        expect(response.status).toBe(400);
    });
});