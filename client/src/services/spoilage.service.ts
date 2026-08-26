import api from "../api/axios";
import type { CreateSpoilageInput, SpoilageRecord } from "../types/Spoilage";

export type { CreateSpoilageInput, SpoilageRecord };

export async function getSpoilageRecords(): Promise<SpoilageRecord[]> {
    const response = await api.get("/spoilage");
  
    return response.data;
}

export async function createSpoilage(
    data: CreateSpoilageInput
): Promise<SpoilageRecord> {
    const response = await api.post("/spoilage", data);
    
    return response.data;
}