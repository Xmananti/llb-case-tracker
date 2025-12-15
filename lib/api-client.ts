export async function getCases(userId: string) {
  try {
    const params = new URLSearchParams({ userId });
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
  plaintiffCase,
  defendantCase,
  workToBeDone,
  caseNumber,
  caseCategory,
  court,
  courtComplex,
  benchJudgeName,
  plaintiff,
  defendant,
  petitioner,
  respondent,
  complainant,
  accused,
  advocateForPetitioner,
  advocateForRespondent,
  publicProsecutor,
  seniorCounsel,
  vakalatFiled,
  currentStage,
  lastHearingDate,
  nextHearingDate,
  hearingPurpose,
  purposeOfHearingStage,
  notes,
  caseType,
  status,
  filingDate,
  userId,
}: {
  title: string;
  description: string;
  plaintiffCase?: string;
  defendantCase?: string;
  workToBeDone?: string;
  caseNumber?: string;
  caseCategory?: string;
  court?: string;
  courtComplex?: string;
  benchJudgeName?: string;
  plaintiff?: string;
  defendant?: string;
  petitioner?: string;
  respondent?: string;
  complainant?: string;
  accused?: string;
  advocateForPetitioner?: string;
  advocateForRespondent?: string;
  publicProsecutor?: string;
  seniorCounsel?: string;
  vakalatFiled?: boolean;
  currentStage?: string;
  lastHearingDate?: string;
  nextHearingDate?: string;
  hearingPurpose?: string;
  purposeOfHearingStage?: string;
  notes?: string;
  caseType?: string;
  status?:
    | "pending"
    | "admitted"
    | "dismissed"
    | "allowed"
    | "disposed"
    | "withdrawn"
    | "compromised"
    | "stayed"
    | "appeal_filed";
  filingDate?: string;
  userId: string;
}) {
  const res = await fetch("/api/cases/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      plaintiffCase,
      defendantCase,
      workToBeDone,
      caseNumber,
      caseCategory,
      court,
      courtComplex,
      benchJudgeName,
      plaintiff,
      defendant,
      petitioner,
      respondent,
      complainant,
      accused,
      advocateForPetitioner,
      advocateForRespondent,
      publicProsecutor,
      seniorCounsel,
      vakalatFiled,
      currentStage,
      lastHearingDate,
      nextHearingDate,
      hearingPurpose,
      purposeOfHearingStage,
      notes,
      caseType,
      status,
      filingDate,
      userId,
    }),
  });
  if (!res.ok) {
    let errorMessage = "Failed to create case";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
      // Include validation details if available
      if (errorData.details) {
        const details =
          errorData.details.fieldErrors || errorData.details.formErrors || [];
        if (details.length > 0) {
          errorMessage += `: ${details.join(", ")}`;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}

export async function updateCase({
  id,
  title,
  description,
  plaintiffCase,
  defendantCase,
  workToBeDone,
  caseNumber,
  caseCategory,
  court,
  courtComplex,
  benchJudgeName,
  plaintiff,
  defendant,
  petitioner,
  respondent,
  complainant,
  accused,
  advocateForPetitioner,
  advocateForRespondent,
  publicProsecutor,
  seniorCounsel,
  vakalatFiled,
  currentStage,
  lastHearingDate,
  nextHearingDate,
  hearingPurpose,
  purposeOfHearingStage,
  notes,
  caseType,
  status,
  filingDate,
  userId,
}: {
  id: string;
  title: string;
  description: string;
  plaintiffCase?: string;
  defendantCase?: string;
  workToBeDone?: string;
  caseNumber?: string;
  caseCategory?: string;
  court?: string;
  courtComplex?: string;
  benchJudgeName?: string;
  plaintiff?: string;
  defendant?: string;
  petitioner?: string;
  respondent?: string;
  complainant?: string;
  accused?: string;
  advocateForPetitioner?: string;
  advocateForRespondent?: string;
  publicProsecutor?: string;
  seniorCounsel?: string;
  vakalatFiled?: boolean;
  currentStage?: string;
  lastHearingDate?: string;
  nextHearingDate?: string;
  hearingPurpose?: string;
  purposeOfHearingStage?: string;
  notes?: string;
  caseType?: string;
  status?:
    | "pending"
    | "admitted"
    | "dismissed"
    | "allowed"
    | "disposed"
    | "withdrawn"
    | "compromised"
    | "stayed"
    | "appeal_filed";
  filingDate?: string;
  userId: string;
}) {
  const res = await fetch("/api/cases/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      title,
      description,
      plaintiffCase,
      defendantCase,
      workToBeDone,
      caseNumber,
      caseCategory,
      court,
      courtComplex,
      benchJudgeName,
      plaintiff,
      defendant,
      petitioner,
      respondent,
      complainant,
      accused,
      advocateForPetitioner,
      advocateForRespondent,
      publicProsecutor,
      seniorCounsel,
      vakalatFiled,
      currentStage,
      lastHearingDate,
      nextHearingDate,
      hearingPurpose,
      purposeOfHearingStage,
      notes,
      caseType,
      status,
      filingDate,
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

// Client API functions
export async function getClients(userId: string) {
  try {
    const params = new URLSearchParams({ userId });
    const res = await fetch(`/api/clients/list?${params.toString()}`);
    if (!res.ok) {
      let errorMessage = "Failed to fetch clients";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch clients");
  }
}

export async function getClient(clientId: string) {
  const res = await fetch(`/api/clients/${clientId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Client not found");
    throw new Error("Failed to fetch client");
  }
  return await res.json();
}

export async function createClient({
  name,
  email,
  phone,
  address,
  notes,
  userId,
}: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  userId: string;
}) {
  const res = await fetch("/api/clients/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      phone,
      address,
      notes,
      userId,
    }),
  });
  if (!res.ok) throw new Error("Failed to create client");
  return await res.json();
}

export async function updateClient({
  id,
  name,
  email,
  phone,
  address,
  notes,
}: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const res = await fetch(`/api/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      phone,
      address,
      notes,
    }),
  });
  if (!res.ok) throw new Error("Failed to update client");
  return await res.json();
}

export async function deleteClient(id: string) {
  const res = await fetch(`/api/clients/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let errorMessage = "Failed to delete client";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      if (res.status === 404) {
        errorMessage = "Client not found";
      } else {
        errorMessage = res.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}

// Payment API functions
export async function getClientPayments(clientId: string) {
  const res = await fetch(`/api/clients/${clientId}/payments`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Client not found");
    throw new Error("Failed to fetch payments");
  }
  return await res.json();
}

export async function createPayment({
  amount,
  date,
  method,
  description,
  clientId,
  userId,
}: {
  amount: number;
  date: string;
  method?: string;
  description?: string;
  clientId: string;
  userId: string;
}) {
  const res = await fetch(`/api/clients/${clientId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      date,
      method,
      description,
      clientId,
      userId,
    }),
  });
  if (!res.ok) throw new Error("Failed to create payment");
  return await res.json();
}

export async function updatePayment({
  id,
  amount,
  date,
  method,
  description,
}: {
  id: string;
  amount?: number;
  date?: string;
  method?: string;
  description?: string;
}) {
  const res = await fetch(`/api/clients/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      date,
      method,
      description,
    }),
  });
  if (!res.ok) throw new Error("Failed to update payment");
  return await res.json();
}

export async function deletePayment(id: string) {
  const res = await fetch(`/api/clients/payments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let errorMessage = "Failed to delete payment";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      if (res.status === 404) {
        errorMessage = "Payment not found";
      } else {
        errorMessage = res.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}
