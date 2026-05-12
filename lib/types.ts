import {
  ATTENDANCE_FIELDS,
  EVENT_FIELDS,
  MEMBER_FIELDS,
} from "./fields";
import type { AirtableRecord } from "./airtable";

export type Member = {
  id: string;
  name: string;
  title: string | null;
  classification: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
};

export type Event = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: string | null;
  location: string | null;
  notes: string | null;
};

export type EventWithCount = Event & { attendeeCount: number };

export type Attendance = {
  id: string;
  checkIn: string | null;
  eventId: string | null;
  memberId: string | null;
  guestName: string | null;
  checkedInAt: string | null;
};

export type AttendanceWithMember = Attendance & {
  member: Member | null;
};

function str(v: unknown): string | null {
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

function linkedFirst(v: unknown): string | null {
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") return v[0];
  return null;
}

export function parseMember(
  rec: AirtableRecord<Record<string, unknown>>,
): Member {
  const f = rec.fields;
  return {
    id: rec.id,
    name: str(f[MEMBER_FIELDS.Name]) ?? "",
    title: str(f[MEMBER_FIELDS.Title]),
    classification: str(f[MEMBER_FIELDS.Classification]),
    email: str(f[MEMBER_FIELDS.Email]),
    phone: str(f[MEMBER_FIELDS.ContactNumber]),
    status: str(f[MEMBER_FIELDS.Status]),
  };
}

export function parseEvent(
  rec: AirtableRecord<Record<string, unknown>>,
): Event {
  const f = rec.fields;
  return {
    id: rec.id,
    name: str(f[EVENT_FIELDS.Name]) ?? "",
    date: str(f[EVENT_FIELDS.Date]) ?? "",
    type: str(f[EVENT_FIELDS.Type]),
    location: str(f[EVENT_FIELDS.Location]),
    notes: str(f[EVENT_FIELDS.Notes]),
  };
}

export function parseAttendance(
  rec: AirtableRecord<Record<string, unknown>>,
): Attendance {
  const f = rec.fields;
  return {
    id: rec.id,
    checkIn: str(f[ATTENDANCE_FIELDS.CheckIn]),
    eventId: linkedFirst(f[ATTENDANCE_FIELDS.Event]),
    memberId: linkedFirst(f[ATTENDANCE_FIELDS.Member]),
    guestName: str(f[ATTENDANCE_FIELDS.GuestName]),
    checkedInAt: str(f[ATTENDANCE_FIELDS.CheckedInAt]),
  };
}
