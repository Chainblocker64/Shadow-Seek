import { Header } from "../components/Header";
import { RoomProvider } from "./RoomProvider";

export default function LobbyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <RoomProvider>
        <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
          <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
              <div className="relative px-4 sm:px-6 lg:px-8 py-8 outline outline-white/30 rounded-3xl flex flex-1 flex-col">
                {children}
              </div>
            </div>
          </div>
        </main>
      </RoomProvider>
    </>
  );
}
