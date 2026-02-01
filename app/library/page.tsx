import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#1f1c17]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6 lg:px-10">
          <AppTopbar />
          <section className="mt-10 rounded-3xl border border-black/5 bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,15,15,0.06)]">
            <h1 className="text-2xl font-semibold">Coming soon</h1>
            <p className="mt-2 text-sm text-black/50">
              This area will be wired up next.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
