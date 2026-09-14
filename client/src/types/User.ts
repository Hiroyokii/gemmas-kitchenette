export interface User {
    id: number;
    firstName: string;
    lastName: string;
    block: string;
    lot: string;
    street: string;
    landmark?: string | null;
    role: "ADMIN" | "STAFF" | "CUSTOMER";
}
