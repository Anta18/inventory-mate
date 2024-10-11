// src/types/index.ts

export interface ItemDetails {
  _id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  status: string;
  brand: string;
  attributes: Record<string, any>;
  image_url?: string;
}

export interface TreeItem {
  _id: string;
  name: string;
  type: "location" | "item";
  children?: TreeItem[];
  itemDetails?: ItemDetails;
  isSubGodown?: boolean; // New flag
  shouldExpand: boolean; // New property
}

export interface Location {
  _id: string;
  name: string;
  parent_godown?: string | null;
  owner: string;
  subGodowns?: Location[];
  items?: Item[];
}
