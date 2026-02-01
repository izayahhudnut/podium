import { UserProfile } from "@clerk/nextjs";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#1f1c17]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6 lg:px-10">
          <AppTopbar />
          <div className="mt-10">
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none border border-black/5",
                },
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
