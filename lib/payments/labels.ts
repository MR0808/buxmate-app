import type {
  ActivityCostType,
  PaymentAllocationMethod,
  PaymentCostScope,
} from "@/generated/prisma/client";

export function formatAllocationMethod(
  method: PaymentAllocationMethod,
  excludeGuestOfHonour: boolean,
): string {
  switch (method) {
    case "ALL_ACTIVE_GUESTS_EXCLUDING_GUEST_OF_HONOUR":
      return "All active guests excluding guest of honour";
    case "ACTIVITY_GOING_GUESTS":
      return excludeGuestOfHonour
        ? "Guests going to activity (excluding guest of honour)"
        : "Guests going to linked activity";
    case "SELECTED_GUESTS":
      return "Selected guests";
    default:
      return excludeGuestOfHonour
        ? "All active guests (excluding guest of honour)"
        : "All active guests (equal split)";
  }
}

export function formatCostScope(scope: PaymentCostScope): string {
  return scope === "ACTIVITY" ? "Activity cost" : "Event-wide shared cost";
}

export function formatActivityCostType(costType: ActivityCostType): string {
  switch (costType) {
    case "FIXED_PER_ATTENDING_GUEST":
      return "Fixed per attending guest";
    case "TOTAL_SPLIT_BY_ATTENDING_GUESTS":
      return "Total split by attending guests";
    default:
      return "Free";
  }
}
