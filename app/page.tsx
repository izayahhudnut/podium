import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits/Benefits";
import CTA from "@/components/landing/CTA";
import Container from "@/components/landing/Container";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/home");
  }

  return (
    <>
      <Hero />
      <div className="w-full bg-[#0F0D13]">
        <Container>
          <Benefits />
        </Container>
      </div>
      <CTA />
    </>
  );
};

export default LandingPage;
