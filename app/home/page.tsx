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
    <div className="min-h-screen bg-white text-[#111111]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-8 py-6 lg:px-14">
          <AppTopbar />

          <section className="mt-8">
            <div className="relative overflow-hidden rounded-xl border border-[#ECECEC] bg-white p-6 text-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
              <DotPattern className="text-black/[0.06]" />
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-4xl font-medium text-[#111111] sm:text-5xl">
                    Welcome to{" "}
                    <SparklesText className="text-[#111111]" sparklesCount={8}>
                      Podium
                    </SparklesText>
                  </p>
                  <p className="mt-2 max-w-2xl text-base text-black/55">
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
              <h2 className="text-3xl font-semibold text-[#111111]">Workspace</h2>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-xl border border-[#ECECEC] bg-white transition hover:-translate-y-1 hover:border-[#dcdcdc] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                href="/rooms?create=1"
              >
                <div className="relative h-36 bg-[#F8F8F8]">
                  <Image
                    src="/Rectangle%20(4).jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold text-[#111111]">Create room</p>
                  <p className="mt-2 text-base text-black/55">
                    Start a new debate with a template, speakers, and timers.
                  </p>
                </div>
              </Link>
              <Link
                className="group w-full max-w-[360px] justify-self-start overflow-hidden rounded-xl border border-[#ECECEC] bg-white transition hover:-translate-y-1 hover:border-[#dcdcdc] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                href="/topics"
              >
                <div className="relative h-36 bg-[#F8F8F8]">
                  <Image
                    src="/Rectangle%20(8).jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pb-4 pt-4">
                  <p className="text-lg font-semibold text-[#111111]">
                    Create topics
                  </p>
                  <p className="mt-2 text-base text-black/55">
                    Build reusable topic templates for consistent debates.
                  </p>
                </div>
              </Link>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black/55">
                Public Debates
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicRooms.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-[#ECECEC] bg-white p-0">
                  <div className="relative h-56">
                    <Image
                      src="/livestream.png"
                      alt=""
                      fill
                      sizes="(max-width: 1280px) 100vw, 400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/22" />
                  </div>
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="rounded-2xl border border-[#ECECEC] bg-white/90 px-4 py-3 text-sm text-[#111111] backdrop-blur">
                      No public debates are live right now.
                    </div>
                  </div>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <article
                    key={room.id}
                    className="rounded-3xl border border-[#ECECEC] bg-white p-4"
                  >
                    <div className="relative h-40 overflow-hidden rounded-2xl bg-[#F8F8F8]">
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
                    <p className="mt-4 text-sm text-black/55">
                      {room.owner_username}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#111111]">
                      {room.title}
                    </p>
                    <Link
                      className="mt-4 inline-flex rounded-full border border-[#ECECEC] bg-[#F8F8F8] px-3 py-1 text-xs text-black/70 transition hover:bg-[#ECECEC] hover:text-[#111111]"
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
