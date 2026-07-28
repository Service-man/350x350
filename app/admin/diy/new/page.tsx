import { AdminShell } from "@/components/AdminShell";
import { DiyGuideForm } from "@/components/DiyGuideForm";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewDiyGuide() {
  await requireAdmin();
  return (
    <AdminShell title="New DIY guide" subtitle="Add the steps and the Amazon product links riders will need.">
      <div className="panel">
        <DiyGuideForm />
      </div>
    </AdminShell>
  );
}
