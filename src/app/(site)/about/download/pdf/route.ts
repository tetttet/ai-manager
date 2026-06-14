import { aboutDownloadHeaders, buildAboutPdf } from "@/lib/about-downloads";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildAboutPdf(), {
    headers: aboutDownloadHeaders.pdf,
  });
}
