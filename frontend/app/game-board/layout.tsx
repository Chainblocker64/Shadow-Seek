import AuthGuard from "../components/AuthGuard";

export default function GameBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
