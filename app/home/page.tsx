import Link from "next/link";
import Image from "next/image";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";
import { getPublicRooms } from "@/lib/rooms";
import { DotPattern } from "@/components/ui/dot-pattern";
import { SparklesText } from "@/components/ui/sparkles-text";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const publicRooms = await getPublicRooms();

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-8 py-6 lg:px-14">
          <AppTopbar />

          <section className="mt-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121214] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <DotPattern className="text-white/[0.08]" />
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-4xl font-bold text-white sm:text-5xl">
                    Welcome to{" "}
                    <SparklesText className="text-white" sparklesCount={8}>
                      Podium
                    </SparklesText>
                  </p>
                  <p className="mt-2 max-w-2xl text-base text-white/60">
                    To help you run clear, structured debates with topics,
                    timing, and live moderation.
                  </p>
                </div>
                <div className="flex w-full items-center justify-end" />
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold text-white">Workspace</h2>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-xl border border-white/10 bg-[#141419] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
                href="/rooms?create=1"
              >
                <div className="relative h-36 bg-[#1b1b20]">
                  <Image
                    src="/Rectangle%20(4).jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold text-white">Create room</p>
                  <p className="mt-2 text-base text-white/60">
                    Start a new debate with a template, speakers, and timers.
                  </p>
                </div>
              </Link>
              <Link
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-xl border border-white/10 bg-[#141419] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
                href="/topics"
              >
                <div className="relative h-36 bg-[#1b1b20]">
                  <Image
                    src="/Rectangle%20(8).jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold text-white">
                    Create topics
                  </p>
                  <p className="mt-2 text-base text-white/60">
                    Build reusable topic templates for consistent debates.
                  </p>
                </div>
              </Link>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/60">
                Public Debates
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicRooms.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141419] p-0">
                  <div className="relative h-56">
                    <Image
                      src="/livestream.png"
                      alt=""
                      fill
                      sizes="(max-width: 1280px) 100vw, 400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/55" />
                  </div>
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80 backdrop-blur">
                      No public debates are live right now.
                    </div>
                  </div>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <article
                    key={room.id}
                    className="rounded-3xl border border-white/10 bg-[#141419] p-4"
                  >
                    <div className="relative h-40 overflow-hidden rounded-2xl bg-[#1b1b20]">
                      {room.header_image_url ? (
                        <Image
                          src={room.header_image_url}
                          alt=""
                          fill
                          sizes="(max-width: 1280px) 100vw, 360px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Image
                            src="/globe.svg"
                            alt=""
                            width={80}
                            height={80}
                            className="h-20 w-20 opacity-70"
                          />
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-white/50">
                      {room.owner_username}
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {room.title}
                    </p>
                    <Link
                      className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                      href={`/${room.owner_username}/${room.slug}`}
                    >
                      View debate
                    </Link>
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
