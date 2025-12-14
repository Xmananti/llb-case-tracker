import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "../lib/api-client";

interface Case {
  id: string;
  title: string;
  description: string;
}

export const useCases = () => {
  const { user, userData } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCases(user.uid, userData?.organizationId);
      setCases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  }, [user, userData?.organizationId]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const addCase = async (title: string, description: string) => {
    if (!user) throw new Error("Not authenticated");
    if (!userData?.organizationId) throw new Error("No organization assigned");
    try {
      await createCase({
        title,
        description,
        userId: user.uid,
        organizationId: userData.organizationId,
      });
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case");
      throw err;
    }
  };

  const editCase = async (id: string, title: string, description: string) => {
    if (!user) throw new Error("Not authenticated");
    try {
      await updateCase({
        id,
        title,
        description,
        userId: user.uid,
        organizationId: userData?.organizationId,
      });
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update case");
      throw err;
    }
  };

  const removeCase = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    try {
      await deleteCase({
        id,
        userId: user.uid,
        organizationId: userData?.organizationId,
      });
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete case");
      throw err;
    }
  };

  return {
    cases,
    loading,
    error,
    addCase,
    editCase,
    removeCase,
    refresh: fetchCases,
  };
};
