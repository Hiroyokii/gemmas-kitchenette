import type { Food } from "./Food";

export interface DailyMenu {
    id: number;
    preparedServings: number;
    remainingServings: number;
    food: Food;
}