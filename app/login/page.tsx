import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  const notAuthorized = sp.error === "not_authorized";
  const sent = sp.sent === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="card w-full max-w-sm p-8" style={{ boxShadow: "var(--shadow-modal)" }}>
        <div className="mb-6 flex items-center gap-2.5">
          <div
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-[#17458F]"
          >
            <img src="/icon.svg" alt="" width={24} height={24} />
          </div>
          <div>
            <div className="text-[15px] font-semibold leading-tight">
              RC Cabanatuan North
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Attendance Tracker
            </div>
          </div>
        </div>

        <h1 className="mb-1 text-[22px] font-semibold tracking-tight">Sign in</h1>
        <p className="mb-6 text-[13px] text-[var(--text-muted)]">
          We&rsquo;ll email you a magic link.
        </p>

        {notAuthorized && (
          <div className="mb-4 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            That email isn&rsquo;t authorized. Contact a club officer to be added.
          </div>
        )}

        {sent ? (
          <div className="rounded-[var(--radius-control)] border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <strong>Check your email.</strong> We sent you a sign-in link.
          </div>
        ) : (
          <LoginForm />
        )}

        <p className="mt-6 text-[11px] text-[var(--text-muted)]">
          Only authorized RCCN officers can sign in.
        </p>
      </div>
    </div>
  );
}
