import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <SignUp fallbackRedirectUrl="/home" signInUrl="/sign-in" />
    </div>
  );
}
