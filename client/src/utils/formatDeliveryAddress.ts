export function formatDeliveryAddress(address: string | null | undefined): string {
    if (!address) return "";

    return address
        .split(",")
        .map((part) => part.trim().replace(/^(Block|Lot)(?:\s+\1)+\s+/i, "$1 "))
        .filter(Boolean)
        .join(", ");
}
