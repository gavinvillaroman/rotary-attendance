import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }

  // Verify the user's email is in allowed_emails. RLS lets each user read their own row only.
  const { data: row } = await supabase
    .from("allowed_emails")
    .select("email")
    .eq("email", data.user.email)
    .maybeSingle();

  if (!row) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=not_authorized`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
