"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { adminFetch } from "@/lib/api/client";
import { EditorToolbar } from "./EditorToolbar";
import type {
  Category,
  PaginatedResponse,
  PostCreateUpdatePayload,
  PostDetail,
  PostStatus,
  Tag,
} from "@/lib/types";

const lowlight = createLowlight(all);

interface PostEditorProps {
  postId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!postId;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [position, setPosition] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [newTagName, setNewTagName] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose max-w-none min-h-[400px] outline-none px-4 py-3",
      },
    },
  });

  // Fetch categories and tags
  useEffect(() => {
    Promise.all([
      adminFetch<PaginatedResponse<Category>>("/admin/categories/", {
        params: { page_size: "100" },
      }),
      adminFetch<PaginatedResponse<Tag>>("/admin/tags/", {
        params: { page_size: "200" },
      }),
    ]).then(([catRes, tagRes]) => {
      setCategories(catRes.results);
      setAllTags(tagRes.results);
    });
  }, []);

  // Load post data when editing
  useEffect(() => {
    if (!postId) return;
    adminFetch<PostDetail>(`/admin/posts/${postId}/`).then((post) => {
      setTitle(post.title);
      setSlug(post.slug);
      setSlugManuallyEdited(true);
      setExcerpt(post.excerpt || "");
      setStatus(post.status);
      setCategoryId(post.category?.id ?? null);
      setTagIds(post.tags.map((t) => t.id));
      setIsFeatured(post.is_featured);
      setPosition(post.position || "");
      editor?.commands.setContent(post.body || "");
      setLoading(false);
    });
  }, [postId, editor]);

  // Auto-slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const handleSave = useCallback(
    async (overrideStatus?: PostStatus) => {
      if (!editor) return;
      setSaving(true);

      const payload: PostCreateUpdatePayload = {
        title,
        slug,
        excerpt,
        body: editor.getHTML(),
        category: categoryId,
        tag_ids: tagIds,
        status: overrideStatus || status,
        is_featured: isFeatured,
        position: position as PostCreateUpdatePayload["position"],
      };

      if ((overrideStatus || status) === "scheduled" && scheduledFor) {
        payload.scheduled_for = scheduledFor;
      }

      try {
        if (isEditing) {
          await adminFetch(`/admin/posts/${postId}/`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          const created = await adminFetch<PostDetail>("/admin/posts/", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          router.push(`/posts/${created.id}/edit`);
          return;
        }
        // Stay on page after update
      } catch (err) {
        alert(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [editor, title, slug, excerpt, status, categoryId, tagIds, isFeatured, position, scheduledFor, isEditing, postId, router],
  );

  const handlePublish = useCallback(() => handleSave("published"), [handleSave]);

  const createTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await adminFetch<Tag>("/admin/tags/", {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      setAllTags((prev) => [...prev, tag]);
      setTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
    } catch {
      // silent
    }
  }, [newTagName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Post" : "Create New Post"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor area */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-2xl font-bold outline-none focus:border-primary-500"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">Slug:</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* TipTap Editor */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Brief summary of the post..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-4">
          {/* Publish controls */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">Publish</h3>
            <div className="mt-3 space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              {status === "scheduled" && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {status === "published" ? "Update" : "Publish"}
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">Category</h3>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagIds.map((id) => {
                const tag = allTags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium"
                  >
                    {tag.name}
                    <button
                      onClick={() =>
                        setTagIds((prev) => prev.filter((t) => t !== id))
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id && !tagIds.includes(id)) {
                  setTagIds((prev) => [...prev, id]);
                }
              }}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Add existing tag...</option>
              {allTags
                .filter((t) => !tagIds.includes(t.id))
                .map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
            </select>
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), createTag())}
                placeholder="Create new tag..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500"
              />
              <button
                onClick={createTag}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">Featured Image</h3>
            <div className="mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-text-secondary cursor-pointer hover:border-primary-400 transition-colors">
              Click to select from media library
            </div>
          </div>

          {/* Position & Featured */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">Display</h3>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded"
                />
                Featured post
              </label>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Position</label>
                <div className="flex flex-wrap gap-2">
                  {["", "hero", "sidebar", "trending"].map((pos) => (
                    <label key={pos} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name="position"
                        value={pos}
                        checked={position === pos}
                        onChange={(e) => setPosition(e.target.value)}
                      />
                      {pos || "None"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold">SEO</h3>
            <div className="mt-2 space-y-2">
              <div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta title"
                  maxLength={70}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <p className="mt-0.5 text-xs text-text-secondary text-right">
                  {metaTitle.length}/70
                </p>
              </div>
              <div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Meta description"
                  maxLength={160}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <p className="mt-0.5 text-xs text-text-secondary text-right">
                  {metaDescription.length}/160
                </p>
              </div>

              {/* SERP Preview */}
              {(metaTitle || title) && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-text-secondary mb-1">Google Preview</p>
                  <p className="text-sm font-medium text-blue-700 truncate">
                    {metaTitle || title}
                  </p>
                  <p className="text-xs text-green-700 truncate">
                    gainciti.com/{slug || "..."}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                    {metaDescription || excerpt || "No description set"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
