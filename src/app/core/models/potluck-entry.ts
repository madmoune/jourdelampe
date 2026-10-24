export interface PotluckEntry {
  readonly id: string;
  readonly name: string;
  readonly dish: string;
  readonly active: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}
