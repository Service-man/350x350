import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { DiyGuideForm } from "@/components/DiyGuideForm";
import { DeleteGuideButton } from "@/components/DeleteGuideButton";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetGuide } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditDiyGuide({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const guide = await adminGetGuide(id);
  if (!guide) notFound();

  return (
    <AdminShell title="Edit DIY guide" subtitle={`/diy/${guide.slug}`} action={<DeleteGuideButton id={guide.id} />}>
      <div className="panel">
        <DiyGuideForm guide={guide} />
      </div>
    </AdminShell>
  );
}
