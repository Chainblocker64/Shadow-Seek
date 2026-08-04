import AuthGuard from "../components/AuthGuard";
import { Header } from "../components/Header";

export default function LeaderboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <Header />
      <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          {children}
        </div>
      </main>
    </AuthGuard>
  );
}
