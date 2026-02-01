import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default function Home() {
  const { userId } = auth();
  if (userId) {
    redirect("/home");
  }

  return (
    <div
      className="min-h-screen bg-white text-[#1b1430]"
      style={{
        fontFamily:
          '"Sora", "Space Grotesk", "Poppins", "Helvetica Neue", sans-serif',
      }}
    >
      <div className="relative overflow-hidden px-4 py-14 sm:px-8 lg:px-12">
        <div className="w-full bg-white px-6 pb-14 pt-2">
          <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-6 rounded-3xl border border-black/10 bg-white px-6 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3 text-sm font-semibold text-black/70">
              <img src="/small-logo.svg" alt="Podium" className="h-9 w-9" />
              Podium
            </div>
            <a
              className="rounded-full border border-black/10 bg-white px-4 py-1 text-sm font-semibold text-black"
              href="/sign-in?redirect_url=/home"
            >
              Sign in
            </a>
          </header>

          <section
            id="home"
            className="mx-auto mt-10 grid max-w-4xl place-items-center gap-6 text-center"
          >
            <div className="flex items-center gap-3 text-xs text-black/50">
              <div className="flex -space-x-2">
                {["/Rectangle.jpg", "/Rectangle%20(1).jpg", "/Rectangle%20(2).jpg", "/Rectangle%20(3).jpg"].map(
                  (src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-8 w-8 rounded-full border border-white/80 object-cover"
                    />
                  )
                )}
              </div>
              10k+ people use Podium
            </div>

            <h1 className="text-4xl font-semibold leading-[1.1] text-black sm:text-5xl md:text-6xl">
              The human <span className="font-semibold text-[#101A25]">way</span>{" "}
              to debate.
            </h1>
            <p className="max-w-2xl text-base text-black/60 sm:text-lg">
              Podium gives hosts a quiet control room and guests a respectful
              way in. It keeps the floor moving, without the noise.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                className="rounded-full bg-[#101A25] px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(16,26,37,0.3)]"
                href="/sign-up?redirect_url=/home"
              >
                Start a debate
              </a>
            </div>
          </section>

          <div className="mx-auto mt-10 flex max-w-5xl justify-center">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px]">
              <img
                src="/hero.png"
                alt="Podium preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="flex w-full flex-col gap-6 px-6 py-10 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <p>Podium © 2026</p>
        <div className="flex flex-wrap gap-6">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </footer>
    </div>
  );
}
