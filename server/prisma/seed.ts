import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    await prisma.role.createMany({
        data:[
            { name: "ADMIN" },
            { name: "STAFF" },
            { name: "CUSTOMER" }
        ],
        skipDuplicates: true,
    });

    console.log("Roles seeded.")

    await prisma.category.createMany({
        data: [
            { name: "Rice Meals" },
            { name: "Chicken Dishes" },
            { name: "Pork Dishes" },
            { name: "Beef Dishes" },
            { name: "Seafood" },
            { name: "Vegetable Dishes" },
            { name: "Soup" },
            { name: "Noodles" },
            { name: "Merienda" },
            { name: "Beverages" },
        ],
        skipDuplicates: true,
    })

    console.log("Categories seeded.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1)

    })
    .finally(async () => {
        await prisma.$disconnect();
    });