"use client";

import { useAuthStore } from "../store/useAuthStore";
import AuthGuard from "../components/AuthGuard";
import ProfileForm from "../components/ProfileForm";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  return (
    <AuthGuard>
      {user && <ProfileForm user={user} setUser={setUser} />}
    </AuthGuard>
  );
}
