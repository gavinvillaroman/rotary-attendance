import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return Response.json({ members: data ?? [] });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      title?: string | null;
      classification?: string | null;
      email?: string | null;
      phone?: string | null;
      status?: "Active" | "Inactive" | "Honorary";
    };
    if (!body.name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .insert({
        name: body.name,
        title: body.title ?? null,
        classification: body.classification ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        status: body.status ?? "Active",
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ member: data });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
