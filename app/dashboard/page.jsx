import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Memuat dashboard...</p>}>
      <DashboardClient />
    </Suspense>
  );
}
