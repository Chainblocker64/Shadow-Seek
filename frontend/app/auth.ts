export interface AuthenticatedUser {
    id: string;
    username: string;
    email: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const token = localStorage.getItem('shadowseek_authToken');
    if (!token) return null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    // jwt invalid:
    if (!response.ok) {
        localStorage.removeItem('shadowseek_auth_token');
        return null;
    }

    // jwt valid:
    return await response.json();
}
