import { useState, useEffect } from "react";
import { getAuthenticatedUser, AuthenticatedUser } from "../auth";

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const userData = await getAuthenticatedUser();

        if (!isMounted) return;

        if (!userData) {
          setUser(null);
        } else {
          setUser(userData);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading };
}
