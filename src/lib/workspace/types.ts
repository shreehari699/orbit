export interface HistoryEntry {
  toolId: string;
  label: string;
  href: string;
  at: string; // ISO timestamp
}

export interface FavoriteEntry {
  toolId: string;
  label: string;
  href: string;
  addedAt: string; // ISO timestamp
}
