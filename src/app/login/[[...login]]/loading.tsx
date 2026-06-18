import { AuthBackButton } from "@/components/auth/auth-back-button";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function Loading() {
  return (
    <AuthPageShell topLeft={<AuthBackButton />}>
      <AuthFormSkeleton />
    </AuthPageShell>
  );
}
