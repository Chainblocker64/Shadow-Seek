import { useState, useEffect } from 'react';
import { getAuthenticatedUser, AuthenticatedUser } from '../auth';

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const hasCookie = document.cookie.includes('is_logged_in=true');
      
      if (!hasCookie) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getAuthenticatedUser();
        if (isMounted) {
          if (!userData) {
            document.cookie = 'is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setUser(null);
          } else {
            setUser(userData);
          }
        }
      } catch (err) {
        if (isMounted) {
          document.cookie = 'is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, []);

  return { user, loading };
}