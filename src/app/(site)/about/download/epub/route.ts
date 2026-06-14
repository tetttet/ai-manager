import { aboutDownloadHeaders, buildAboutEpub } from "@/lib/about-downloads";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildAboutEpub(), {
    headers: aboutDownloadHeaders.epub,
  });
}
