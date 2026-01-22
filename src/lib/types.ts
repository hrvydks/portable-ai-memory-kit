export type Canon = {
  id: "canon";
  updatedAt: number;
  identityGoals: string;
  rules: string;
  preferences: string;
  glossary: string;
};

export type CurrentState = {
  id: "current";
  updatedAt: number;
  now: string;
  today: string;
};

export type DeltaArea = "Work" | "Personal" | "Parenting" | "Health" | "Admin" | "Other";
export type DeltaType = "Decision" | "Update" | "Insight" | "Incident" | "Preference";

export type Delta = {
  id: string;
  dateISO: string;
  area: DeltaArea;
  type: DeltaType;
  summary: string;
  details: string;
  tags: string[];
};

export type MemoryData = {
  canon: Canon;
  current: CurrentState;
  deltas: Delta[];
};

export const deltaAreas: DeltaArea[] = [
  "Work",
  "Personal",
  "Parenting",
  "Health",
  "Admin",
  "Other"
];

export const deltaTypes: DeltaType[] = [
  "Decision",
  "Update",
  "Insight",
  "Incident",
  "Preference"
];

export const defaultCanon: Canon = {
  id: "canon",
  updatedAt: Date.now(),
  identityGoals: "",
  rules: "",
  preferences: "",
  glossary: ""
};

export const defaultCurrent: CurrentState = {
  id: "current",
  updatedAt: Date.now(),
  now: "",
  today: ""
};
