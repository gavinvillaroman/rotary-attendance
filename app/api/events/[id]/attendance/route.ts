import { createClient } from "@/lib/supabase/server";
import type { AttendanceWithMember } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attendance")
      .select("*, member:members(id,name,title)")
      .eq("event_id", id)
      .order("checked_in_at", { ascending: false });
    if (error) throw error;
    return Response.json({
      attendance: (data ?? []) as unknown as AttendanceWithMember[],
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      memberId?: string;
      guestName?: string;
    };
    if (!body.memberId && !body.guestName) {
      return Response.json(
        { error: "memberId or guestName required" },
        { status: 400 },
      );
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        event_id: id,
        member_id: body.memberId ?? null,
        guest_name: body.guestName ?? null,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ attendance: data });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
