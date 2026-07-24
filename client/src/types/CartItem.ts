import type { DailyMenu } from "./DailyMenu";

export interface CartItem {
    menu: DailyMenu;
    quantity: number;
}