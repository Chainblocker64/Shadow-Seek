import { useState, useEffect } from "react";
import { getAuthenticatedUser, AuthenticatedUser } from "../auth";

const clearLoginCookie = () => {
  document.cookie =
    "is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      if (!document.cookie.includes("is_logged_in=true")) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userData = await getAuthenticatedUser();

        if (!isMounted) return;

        if (!userData) {
          clearLoginCookie();
          setUser(null);
        } else {
          setUser(userData);
        }
      } catch {
        if (isMounted) {
          clearLoginCookie();
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
