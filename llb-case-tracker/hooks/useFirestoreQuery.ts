import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Query,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "../lib/firebase/config";

const db = getFirestore(app);

export const useFirestoreQuery = <T>(
  collectionName: string,
  conditions?: Array<{
    field: string;
    operator:
      | "=="
      | "!="
      | "<"
      | "<="
      | ">"
      | ">="
      | "array-contains"
      | "in"
      | "array-contains-any";
    value: unknown;
  }>,
  realtime = false
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conditionsKey = useMemo(() => {
    return conditions ? JSON.stringify(conditions) : "";
  }, [conditions]);

  useEffect(() => {
    let q: Query;
    const col = collection(db, collectionName);

    if (conditions && conditions.length > 0) {
      let queryRef: Query = col;
      conditions.forEach((cond) => {
        queryRef = query(
          queryRef,
          where(cond.field, cond.operator, cond.value)
        );
      });
      q = queryRef;
    } else {
      q = query(col);
    }

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const results = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as T)
          );
          setData(results);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      getDocs(q)
        .then((snapshot) => {
          const results = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as T)
          );
          setData(results);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [collectionName, conditionsKey, realtime, conditions]);

  return { data, loading, error };
};
