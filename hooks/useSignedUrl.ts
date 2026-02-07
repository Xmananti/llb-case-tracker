import { useState, useEffect } from "react";

/**
 * Fetches a short-lived signed URL for a private GCS object URL.
 * Use for displaying or downloading files when the bucket is not public.
 */
export function useSignedUrl(storedUrl: string | null): {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
} {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storedUrl) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSignedUrl(null);

    fetch(
      `/api/files/signed-url?url=${encodeURIComponent(storedUrl)}`
    )
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(b));
        return res.json();
      })
      .then((data: { url: string }) => {
        if (!cancelled) {
          setSignedUrl(data.url);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.error || "Failed to get link");
          setSignedUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storedUrl]);

  return { signedUrl, loading, error };
}
