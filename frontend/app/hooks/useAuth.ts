import { useState, useEffect } from 'react';
import { getAuthenticatedUser, AuthenticatedUser } from '../auth';

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const userData = await getAuthenticatedUser();
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, []);

  return { user, loading };
}