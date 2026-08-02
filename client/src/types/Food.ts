export interface Category {
    id: number;
    name: string;
}

export interface Food {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    isAvailable: boolean;
    categoryId: number;
    category?: Category;
}