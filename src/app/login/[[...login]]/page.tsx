import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { authAppearance } from "@/components/auth/auth-appearance";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={authAppearance}
      />
    </AuthPageShell>
  );
}
