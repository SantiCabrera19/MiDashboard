// ─── Root Page ──────────────────────────────────────────
// This page handles the "/" route. Since our app is a dashboard,
// there's no landing page — we redirect straight to /notes.
//
// WHY redirect() instead of a landing page?
// - MeDashboard is a private app (auth required in Phase 5)
// - No public-facing content needed at "/"
// - redirect() is a server-side redirect (302) — fast, no JS needed
//
// In Phase 5 with auth, this could redirect to /login if not
// authenticated, or to /notes if authenticated.

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/notes");
}
