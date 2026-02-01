import { auth } from "@clerk/nextjs/server";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";
import { getPublicRooms, getRoomsByOwner } from "@/lib/rooms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = auth();
  const rooms = userId ? await getRoomsByOwner(userId) : [];
  const roomCards = rooms.slice(0, 2);
  const publicRooms = await getPublicRooms();

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#1f1c17]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6 lg:px-10">
          <AppTopbar />

          <section className="mt-8">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(15,15,15,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">Welcome to Podium</p>
                  <p className="mt-2 max-w-2xl text-sm text-black/50">
                    To help you run clear, structured debates from day one, we've
                    gathered resources to get you started quickly. Watch the
                    short tutorial or dive into your first session.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex h-36 w-full max-w-md items-center justify-center rounded-2xl border border-black/10 bg-[#f2f2f2] text-xs uppercase tracking-[0.3em] text-black/40">
                  Video placeholder
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold">Izayah's Workspace</h2>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {roomCards.map((room) => (
                <article
                  key={room.id}
                  className="flex items-center justify-between rounded-3xl border border-black/10 bg-white px-6 py-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2f2f2]">
                      <img src="/small-logo.svg" alt="" className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-base font-semibold">{room.title}</p>
                      <p className="text-xs text-black/40">Recently used</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-black/50">
                    <button className="rounded-full border border-black/10 px-3 py-1">
                      Setup
                    </button>
                    <a
                      className="rounded-full border border-black/10 px-3 py-1"
                      href={`/${room.owner_username}/${room.slug}`}
                    >
                      Start session
                    </a>
                  </div>
                </article>
              ))}
              <a
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
                href="/rooms?create=1"
              >
                <div className="h-36 bg-[#f2f2f2]">
                  <img
                    src="/Rectangle.jpg"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold">Create room</p>
                  <p className="mt-2 text-base text-black/60">
                    Start a new debate with a template, speakers, and timers.
                  </p>
                </div>
              </a>
              <a
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
                href="/topics"
              >
                <div className="h-36 bg-[#f2f2f2]">
                  <img
                    src="/Rectangle%20(1).jpg"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold">Create topics</p>
                  <p className="mt-2 text-base text-black/60">
                    Build reusable topic templates for consistent debates.
                  </p>
                </div>
              </a>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black/60">
                Public Debates
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicRooms.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-[2px]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(240,240,240,0.85)), url('/globe.svg')",
                    }}
                  />
                  <div className="relative z-10">
                    <img src="/globe.svg" alt="" className="h-10 w-10" />
                    <p className="mt-4 text-lg font-semibold">
                      No public debates yet
                    </p>
                    <p className="mt-2 text-sm text-black/50">
                      Turn on “Make public” when creating a room to show it
                      here.
                    </p>
                  </div>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <article
                    key={room.id}
                    className="rounded-3xl border border-black/10 bg-white p-4"
                  >
                    <div className="h-40 overflow-hidden rounded-2xl bg-[#f2f2f2]">
                      {room.header_image_url ? (
                        <img
                          src={room.header_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <img src="/globe.svg" alt="" className="h-20 w-20" />
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-black/40">
                      {room.owner_username}
                    </p>
                    <p className="mt-1 text-base font-semibold">{room.title}</p>
                    <a
                      className="mt-4 inline-flex rounded-full border border-black/10 px-3 py-1 text-xs text-black/60"
                      href={`/${room.owner_username}/${room.slug}`}
                    >
                      View debate
                    </a>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
