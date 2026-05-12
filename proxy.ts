import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals, static assets, AND public auth routes —
    // those don't need a session check and shouldn't pay the latency.
    "/((?!_next/static|_next/image|favicon.ico|icon\\.png|login|auth/|api/auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
