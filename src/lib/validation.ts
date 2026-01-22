import { Canon, CurrentState, Delta, MemoryData, deltaAreas, deltaTypes } from "@/lib/types";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const isString = (value: unknown): value is string => typeof value === "string";

const isDelta = (value: any): value is Delta => {
  return (
    value &&
    isString(value.id) &&
    isString(value.dateISO) &&
    deltaAreas.includes(value.area) &&
    deltaTypes.includes(value.type) &&
    isString(value.summary) &&
    isString(value.details) &&
    Array.isArray(value.tags) &&
    value.tags.every((tag: unknown) => isString(tag))
  );
};

export function validateData(payload: any): ValidationResult {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Payload is not an object"] };
  }

  const canon = payload.canon as Canon | undefined;
  const current = payload.current as CurrentState | undefined;
  const deltas = payload.deltas as Delta[] | undefined;

  if (!canon) {
    errors.push("Missing canon");
  } else {
    if (!isString(canon.identityGoals)) errors.push("Canon.identityGoals must be a string");
    if (!isString(canon.rules)) errors.push("Canon.rules must be a string");
    if (!isString(canon.preferences)) errors.push("Canon.preferences must be a string");
    if (!isString(canon.glossary)) errors.push("Canon.glossary must be a string");
  }

  if (!current) {
    errors.push("Missing current");
  } else {
    if (!isString(current.now)) errors.push("Current.now must be a string");
    if (!isString(current.today)) errors.push("Current.today must be a string");
  }

  if (!Array.isArray(deltas)) {
    errors.push("Deltas must be an array");
  } else if (!deltas.every(isDelta)) {
    errors.push("One or more deltas are invalid");
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeData(payload: MemoryData): MemoryData {
  return {
    canon: { ...payload.canon, id: "canon", updatedAt: payload.canon.updatedAt || Date.now() },
    current: { ...payload.current, id: "current", updatedAt: payload.current.updatedAt || Date.now() },
    deltas: payload.deltas.map((delta) => ({
      ...delta,
      tags: delta.tags ?? []
    }))
  };
}
