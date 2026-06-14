import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { authAppearance } from "@/components/auth/auth-appearance";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        appearance={authAppearance}
      />
    </AuthPageShell>
  );
}
