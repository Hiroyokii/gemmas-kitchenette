import api from "../api/axios";

export type SpoilageReason = "EXPIRED" | "SPOILED" | "WASTE";
export interface InventoryBatch { id: number; remainingQuantity: number; unitCost: number; expirationDate?: string | null; ingredient: { id: number; name: string; unit?: { name: string } }; purchase: { createdAt: string } }
export interface SpoilageRecord { id: number; quantity: number; reason: SpoilageReason; notes?: string | null; recordedAt: string; ingredient: { name: string; unit?: { name: string } }; purchaseItem?: { expirationDate?: string | null; purchase: { createdAt: string } } | null; recordedBy?: { firstName: string; lastName: string } | null }
export async function getSpoilageRecords(): Promise<SpoilageRecord[]> { return (await api.get("/spoilage")).data; }
export async function getAvailableBatches(): Promise<InventoryBatch[]> { return (await api.get("/spoilage/batches")).data; }
export async function recordSpoilage(data: { purchaseItemId: number; quantity: number; reason: "SPOILED" | "WASTE"; notes?: string }): Promise<void> { await api.post("/spoilage", data); }
