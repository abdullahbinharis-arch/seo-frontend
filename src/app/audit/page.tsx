import { redirect } from "next/navigation";

// Legacy /audit route — redirect to the dashboard audit page
export default function LegacyAuditPage() {
  redirect("/dashboard/audit");
}
