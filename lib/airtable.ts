// Server-only Airtable REST helper.
// IMPORTANT: do not import this from client components.

import "server-only";

const API_BASE = "https://api.airtable.com/v0";

export type AirtableRecord<F = Record<string, unknown>> = {
  id: string;
  createdTime: string;
  fields: F;
};

export type AirtableListResponse<F = Record<string, unknown>> = {
  records: AirtableRecord<F>[];
  offset?: string;
};

function getEnv() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token) throw new Error("AIRTABLE_TOKEN is not set");
  if (!baseId) throw new Error("AIRTABLE_BASE_ID is not set");
  return { token, baseId };
}

export async function airtable<T = unknown>(
  table: string,
  path: string = "",
  init: RequestInit = {},
): Promise<T> {
  const { token, baseId } = getEnv();
  const url = `${API_BASE}/${baseId}/${table}${path}`;
  const method = (init.method ?? "GET").toUpperCase();
  const isRead = method === "GET";
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    // Reads: cache for 30s with a tag so writes can invalidate.
    // Writes: never cache.
    ...(isRead
      ? { next: { revalidate: 30, tags: ["airtable"] } }
      : { cache: "no-store" as const }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable ${res.status} ${res.statusText}: ${text}`);
  }
  // Some DELETEs return JSON; this works for all 2xx with a JSON body.
  return res.json() as Promise<T>;
}

// Fetch all records with pagination, returning field-IDed records.
export async function airtableListAll<F = Record<string, unknown>>(
  table: string,
  params: Record<string, string | string[]> = {},
): Promise<AirtableRecord<F>[]> {
  const out: AirtableRecord<F>[] = [];
  let offset: string | undefined;
  do {
    const search = new URLSearchParams();
    search.set("returnFieldsByFieldId", "true");
    search.set("pageSize", "100");
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach((x) => search.append(k, x));
      else search.set(k, v);
    }
    if (offset) search.set("offset", offset);
    const data = await airtable<AirtableListResponse<F>>(
      table,
      `?${search.toString()}`,
    );
    out.push(...data.records);
    offset = data.offset;
  } while (offset);
  return out;
}
