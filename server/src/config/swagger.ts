import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Gemma's Kitchenette API",
            version: "1.0.0",
            description:
                "Backend API for Gemma's Kitchenette",
        },
    },

    apis: [
        "./src/routes/*.ts",
    ],
};

export const swaggerSpec =
    swaggerJsdoc(options);