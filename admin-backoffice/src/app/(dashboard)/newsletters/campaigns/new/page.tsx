"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api/client";
import { toast } from "@/components/common/Toast";
import { confirmModal } from "@/components/common/ConfirmModal";
import type { Campaign } from "@/lib/types";

export default function NewCampaignPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSave = useCallback(async () => {
    if (!subject.trim()) return;
    setSaving(true);
    try {
      await adminFetch<Campaign>("/admin/newsletter/campaigns/", {
        method: "POST",
        body: JSON.stringify({ subject, body_html: bodyHtml }),
      });
      toast.success("Campaign saved");
      router.push("/newsletters");
    } catch (err) {
      toast.error("Save failed", err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }, [subject, bodyHtml, router]);

  const handleSend = useCallback(async () => {
    if (!subject.trim() || !bodyHtml.trim()) {
      toast.warning("Missing fields", "Subject and body are required to send");
      return;
    }
    const ok = await confirmModal({
      title: "Send campaign",
      message: "This campaign will be sent to all confirmed subscribers. This action cannot be undone.",
      confirmLabel: "Send now",
      variant: "warning",
    });
    if (!ok) return;
    setSending(true);
    try {
      const campaign = await adminFetch<Campaign>(
        "/admin/newsletter/campaigns/",
        {
          method: "POST",
          body: JSON.stringify({ subject, body_html: bodyHtml }),
        },
      );
      await adminFetch(`/admin/newsletter/campaigns/${campaign.id}/send/`, {
        method: "POST",
      });
      toast.success("Campaign sent", "Your newsletter is being delivered to all subscribers");
      router.push("/newsletters");
    } catch (err) {
      toast.error("Send failed", err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSending(false);
    }
  }, [subject, bodyHtml, router]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Campaign</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Compose and send a newsletter to your subscribers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !subject.trim()}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !bodyHtml.trim()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Campaign"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Campaign subject line..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Body (HTML)</label>
              <button
                onClick={() => setPreview(!preview)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div
                className="min-h-[400px] rounded-lg border border-gray-200 bg-white p-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={20}
                placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm outline-none focus:border-primary-500"
              />
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div>
          <h3 className="text-sm font-medium mb-2">Email Preview</h3>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Fake email header */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 space-y-1.5">
              <div className="flex gap-2 text-sm">
                <span className="text-text-secondary w-16">From:</span>
                <span className="font-medium">GainCiti Newsletter</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-text-secondary w-16">Subject:</span>
                <span className="font-medium">{subject || "(no subject)"}</span>
              </div>
            </div>
            {/* Email body */}
            <div className="p-6">
              {bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : (
                <p className="text-text-secondary text-sm">
                  Start composing your email to see a preview here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
