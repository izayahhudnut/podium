import Hero from "@/components/landing/Hero";
import Logos from "@/components/landing/Logos";
import Benefits from "@/components/landing/Benefits/Benefits";
import Container from "@/components/landing/Container";
import Section from "@/components/landing/Section";
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
      <Logos />
      <Container>
        <Benefits />

      </Container>
    </>
  );
};

export default LandingPage;
