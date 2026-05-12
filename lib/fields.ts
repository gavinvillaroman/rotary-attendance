// Airtable table + field ID constants for the Rotary base
// Base: appjrCXmKfLR6MLGL

export const TABLES = {
  Members: "tblKR99JLmo85ER7R",
  Events: "tblUS7a8PKhSj8CFG",
  Attendance: "tblRMKKZ168TgPAC7",
} as const;

export const MEMBER_FIELDS = {
  Name: "fldpCTByv2R3QTAS9",
  Title: "fldlHTSBgAACzHVZR",
  Classification: "fldZpFPIVdnEJYIsa",
  ContactNumber: "fldHWSyjkHX5WQ0Qp",
  Email: "fldCD6hgEkul9mDZz",
  Status: "fldmUpeLOWaOTAWCz",
} as const;

export const EVENT_FIELDS = {
  Name: "fldPPAoCW25HfAb3U",
  Date: "fldCBSzhzzhBmQHNx",
  Type: "fldRbTIvGTuF8BMR3",
  Location: "fldwM975O655DIgcm",
  Notes: "fldeee44TivNXd6KC",
} as const;

export const ATTENDANCE_FIELDS = {
  CheckIn: "fldsJ1NFCi9zUVjYV",
  Event: "fldJCXJezeoHHyaAZ",
  Member: "fldqUqxhdZ2I3vGjP",
  GuestName: "fld6mb22llR9GRJBU",
  CheckedInAt: "fldXG6CaqmBzGry9x",
} as const;

export const EVENT_TYPES = [
  "Weekly Meeting",
  "Board Meeting",
  "Fundraiser",
  "Social",
  "Service Project",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
