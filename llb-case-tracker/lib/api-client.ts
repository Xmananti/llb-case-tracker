export async function getCases(userId: string) {
  const res = await fetch(`/api/cases/list?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return await res.json();
}

export async function getCase(caseId: string, userId?: string) {
  const url = userId
    ? `/api/cases/${caseId}?userId=${userId}`
    : `/api/cases/${caseId}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Case not found");
    if (res.status === 403) throw new Error("Unauthorized");
    throw new Error("Failed to fetch case");
  }
  return await res.json();
}

export async function createCase({
  title,
  description,
  caseNumber,
  court,
  oppositeParty,
  caseType,
  status,
  filingDate,
  nextHearingDate,
  userId,
}: {
  title: string;
  description: string;
  caseNumber?: string;
  court?: string;
  oppositeParty?: string;
  caseType?: string;
  status?: "active" | "closed" | "pending" | "on_hold";
  filingDate?: string;
  nextHearingDate?: string;
  userId: string;
}) {
  const res = await fetch("/api/cases/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      caseNumber,
      court,
      oppositeParty,
      caseType,
      status,
      filingDate,
      nextHearingDate,
      userId,
    }),
  });
  if (!res.ok) throw new Error("Failed to create");
  return await res.json();
}

export async function updateCase({
  id,
  title,
  description,
  caseNumber,
  court,
  oppositeParty,
  caseType,
  status,
  filingDate,
  nextHearingDate,
  userId,
}: {
  id: string;
  title: string;
  description: string;
  caseNumber?: string;
  court?: string;
  oppositeParty?: string;
  caseType?: string;
  status?: "active" | "closed" | "pending" | "on_hold";
  filingDate?: string;
  nextHearingDate?: string;
  userId: string;
}) {
  const res = await fetch("/api/cases/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      title,
      description,
      caseNumber,
      court,
      oppositeParty,
      caseType,
      status,
      filingDate,
      nextHearingDate,
      userId,
    }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return await res.json();
}

export async function deleteCase({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const res = await fetch("/api/cases/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, userId }),
  });
  if (!res.ok) throw new Error("Failed to delete");
  return await res.json();
}
