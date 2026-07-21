export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) return null;
  return (await res.json()) as Promise<AuthenticatedUser>;
}

export async function protectPage(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    window.location.href = "/";
    return null;
  }
  return user;
}
