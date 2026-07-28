import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { BlogPostForm } from "@/components/BlogPostForm";
import { DeletePostButton } from "@/components/DeletePostButton";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetPost } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  return (
    <AdminShell
      title="Edit blog post"
      subtitle={`/blog/${post.slug}`}
      action={<DeletePostButton id={post.id} />}
    >
      <div className="panel">
        <BlogPostForm post={post} />
      </div>
    </AdminShell>
  );
}
