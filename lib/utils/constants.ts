export const COLLECTIONS = {
  CASES: "cases",
  DOCUMENTS: "documents",
  HEARINGS: "hearings",
  TASKS: "tasks",
  USERS: "users",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CASES: "/cases",
  PROFILE: "/profile",
} as const;

export const STORAGE_PATHS = {
  CASE_DOCUMENTS: (caseId: string) => `cases/${caseId}/documents`,
} as const;

export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
  WARNING: 4000,
} as const;
