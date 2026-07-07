import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    await prisma.role.createMany({
        data:[
            {name: "ADMIN"},
            {name: "STAFF"},
            {name: "CUSTOMER"}
        ],
        skipDuplicates: true,
    });

    console.log("Roles seeded.")
}

main()
    .catch((error) => {
        console.log(error);
        process.exit(1)

    })
    .finally(async () => {
        await prisma.$disconnect();
    });