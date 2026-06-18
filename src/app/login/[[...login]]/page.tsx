import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { authAppearance } from "@/components/auth/auth-appearance";
import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <AuthPageShell topLeft={<AuthBackButton />}>
      <ClerkLoading>
        <AuthFormSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          appearance={authAppearance}
        />
      </ClerkLoaded>
    </AuthPageShell>
  );
}
