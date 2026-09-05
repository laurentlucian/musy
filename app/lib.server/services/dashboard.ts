import { env } from "cloudflare:workers";
import { getDashboardStore, refreshDashboardStore } from "./dashboard-store";

export async function getDashboard(userId: string, year: number) {
  return getDashboardStore(env.D1, userId, year);
}

export async function refreshDashboard(userId: string, year: number) {
  return refreshDashboardStore(env.D1, userId, year);
}
