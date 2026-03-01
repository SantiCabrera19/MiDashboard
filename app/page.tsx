// ─── Root Page ──────────────────────────────────────────
// This page handles the "/" route. Since our app is a dashboard,
// we redirect straight to /home — the central dashboard overview.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home");
}
