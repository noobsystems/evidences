export interface InventoryItem<Details> {
    imagePath: string;
    label: string;
    slot: number;
    details: Details
}

export interface Inventory<Details> {
    inventory: number | string;
    label: string;
    items: InventoryItem<Details>[];
}

export type InventoriesType<Details> = Inventory<Details>[];