export interface AuthenticatedUser {
    id: string;
    username: string;
    email: string;
}

/**
 * get data for current logged in user
 * 
 * @returns AuthenticatedUser | null
 */
export async function getAuthenticatedUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    credentials: 'include'
  });

  if (!res.ok) return null;
  return await res.json();
}

/**
 * redirect home if user is not authenticated
 * 
 * @returns AuthenticatedUser | null
 */
export async function protectPage(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    window.location.href = '/'; 
    return null;
  }
  return user;
}