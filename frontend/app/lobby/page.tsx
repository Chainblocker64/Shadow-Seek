import AuthGuard from "../components/AuthGuard";
import RoomList from "./components/RoomList";

export default function Lobby() {
  return (
    <AuthGuard>
      <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
        <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
            <RoomList />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
