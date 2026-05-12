export type MemberStatus = "Active" | "Inactive" | "Honorary";
export type CllaStatus = "Confirmed" | "Paid" | "Declined";

export type Member = {
  id: string;
  airtable_id: string | null;
  name: string;
  title: string | null;
  classification: string | null;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  clla_2026_status: CllaStatus | null;
  clla_2026_amount_paid: number | null;
  created_at: string;
};

export type Event = {
  id: string;
  airtable_id: string | null;
  name: string;
  event_date: string; // YYYY-MM-DD
  type: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export type EventWithCount = Event & { attendeeCount: number };

export type Attendance = {
  id: string;
  airtable_id: string | null;
  event_id: string;
  member_id: string | null;
  guest_name: string | null;
  checked_in_at: string;
};

export type AttendanceWithMember = Attendance & {
  member: Pick<Member, "id" | "name" | "title"> | null;
};

export const EVENT_TYPES = [
  "Weekly Meeting",
  "Board Meeting",
  "Fundraiser",
  "Social",
  "Service Project",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
