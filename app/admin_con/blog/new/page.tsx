import { AdminShell } from "@/components/AdminShell";
import { BlogPostForm } from "@/components/BlogPostForm";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewBlogPost() {
  await requireAdmin();
  return (
    <AdminShell title="New blog post" subtitle="Write in the editor; publish when ready or save as a draft.">
      <div className="panel">
        <BlogPostForm />
      </div>
    </AdminShell>
  );
}
