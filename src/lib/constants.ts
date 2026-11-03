export type ToolCategory =
  | "power_tools"
  | "garden"
  | "kitchen"
  | "camping"
  | "hand_tools"
  | "other";

export type ToolCondition = "like_new" | "good" | "fair";

export const CATEGORIES: {
  id: ToolCategory;
  label: string;
  shortLabel: string;
}[] = [
  { id: "power_tools", label: "Power Tools", shortLabel: "Power" },
  { id: "garden", label: "Garden & Yard", shortLabel: "Garden" },
  { id: "kitchen", label: "Kitchen & Cooking", shortLabel: "Kitchen" },
  { id: "camping", label: "Outdoor & Camping", shortLabel: "Camping" },
  { id: "hand_tools", label: "Hand Tools", shortLabel: "Hand" },
  { id: "other", label: "General Equipment", shortLabel: "Other" },
];

export const CONDITIONS: {
  id: ToolCondition;
  label: string;
  bars: number;
  description: string;
}[] = [
  {
    id: "like_new",
    label: "Like New",
    bars: 3,
    description: "Flawless condition, minimal wear",
  },
  {
    id: "good",
    label: "Good",
    bars: 2,
    description: "Fully functional with normal cosmetic signs",
  },
  {
    id: "fair",
    label: "Fair",
    bars: 1,
    description: "Well-used, works reliably as intended",
  },
];

export function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.id === category);
  return found ? found.label : category;
}

export function getConditionData(condition: string) {
  const found = CONDITIONS.find((c) => c.id === condition);
  return found || { id: condition, label: condition, bars: 1, description: "" };
}
