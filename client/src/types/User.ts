export interface User {
    id: number;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "STAFF" | "CUSTOMER";
}