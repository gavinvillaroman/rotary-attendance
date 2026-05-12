import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      date?: string;
      type?: string;
      location?: string;
    };
    if (!body.name || !body.date) {
      return Response.json(
        { error: "name and date are required" },
        { status: 400 },
      );
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .insert({
        name: body.name,
        event_date: body.date,
        type: body.type || null,
        location: body.location || null,
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ event: data });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
