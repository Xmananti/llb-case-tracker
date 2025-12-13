export async function getCases(userId: string, organizationId?: string) {
  try {
    const params = new URLSearchParams({ userId });
    if (organizationId) {
      params.append("organizationId", organizationId);
    }
    const res = await fetch(`/api/cases/list?${params.toString()}`);
    if (!res.ok) {
      let errorMessage = "Failed to fetch cases";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (error) {
    // Re-throw with better context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch cases");
  }
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
  organizationId,
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
  organizationId: string;
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
      organizationId,
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
  organizationId,
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
  organizationId?: string;
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
      organizationId,
    }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return await res.json();
}

export async function deleteCase({
  id,
  userId,
  organizationId,
}: {
  id: string;
  userId: string;
  organizationId?: string;
}) {
  const res = await fetch("/api/cases/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, userId, organizationId }),
  });
  if (!res.ok) {
    let errorMessage = "Failed to delete case";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      if (res.status === 403) {
        errorMessage =
          "Unauthorized: You don't have permission to delete this case";
      } else if (res.status === 404) {
        errorMessage = "Case not found";
      } else {
        errorMessage = res.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}

// Organization API functions
export async function createOrganization(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  domain?: string;
  subscriptionPlan: "free" | "starter" | "professional" | "enterprise";
  createdBy: string;
}) {
  const res = await fetch("/api/organizations/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create organization");
  return await res.json();
}

export async function getOrganizations(createdBy?: string) {
  const url = createdBy
    ? `/api/organizations/list?createdBy=${createdBy}`
    : "/api/organizations/list";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return await res.json();
}

export async function getOrganization(orgId: string) {
  const res = await fetch(`/api/organizations/${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch organization");
  return await res.json();
}

export async function updateOrganizationSubscription(
  orgId: string,
  data: {
    subscriptionPlan: "free" | "starter" | "professional" | "enterprise";
    subscriptionStatus?: "active" | "trial" | "expired" | "cancelled";
  }
) {
  const res = await fetch(`/api/organizations/${orgId}/subscription`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update subscription");
  return await res.json();
}
