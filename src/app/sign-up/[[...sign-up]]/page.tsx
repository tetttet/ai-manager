import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { authAppearance } from "@/components/auth/auth-appearance";
import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthPageShell topLeft={<AuthBackButton />}>
      <ClerkLoading>
        <AuthFormSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/login"
          fallbackRedirectUrl="/onboarding/workspace"
          appearance={authAppearance}
        />
      </ClerkLoaded>
    </AuthPageShell>
  );
}
