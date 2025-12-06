"use client"

import { useMemo, useState } from "react"
import { AttachmentPreview } from "@/components/admin/AttachmentPreview"

type AdminAttachment = {
  id: string
  application_id: string
  path: string
  bucket: string
  file_type: string | null
  metadata: Record<string, unknown> | null
  created_at: string | null
  signedUrl: string | null
}

function isPreviewable(att: AdminAttachment) {
  const mime = (att.file_type || "").toLowerCase()
  const name = att.path.toLowerCase()
  const isImage = mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
  const isPdf = mime === "application/pdf" || /\.pdf$/i.test(name)
  return isImage || isPdf
}

export function AttachmentList({ attachments }: { attachments: AdminAttachment[] }) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const current = useMemo(
    () => attachments.find((a) => a.id === previewId) || null,
    [attachments, previewId]
  )

  const displayName = (att: AdminAttachment) => {
    const originalName = typeof att.metadata?.originalName === "string" ? att.metadata.originalName : null
    const fallbackName = att.path.split("/").pop() || att.path
    return originalName ?? fallbackName
  }

  return (
    <details className="border rounded-md p-3 bg-slate-50">
      <summary className="cursor-pointer text-sm font-medium text-slate-800">
        Attachments ({attachments.length})
      </summary>
      <div className="mt-2 space-y-2 text-sm">
        {attachments.length === 0 && <div className="text-slate-600">No attachments</div>}
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-slate-800">{displayName(att)}</div>
              <div className="text-xs text-slate-600">
                {att.file_type || "file"} • {att.created_at ? new Date(att.created_at).toLocaleString() : "—"}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPreviewable(att) && att.signedUrl ? (
                <button
                  onClick={() => setPreviewId(att.id)}
                  className="text-blue-600 underline"
                  type="button"
                >
                  Preview
                </button>
              ) : null}
              {att.signedUrl ? (
                <a href={att.signedUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                  Download
                </a>
              ) : (
                <span className="text-xs text-red-600">No link</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {current && current.signedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-900 text-sm">{displayName(current)}</div>
              <div className="flex gap-2">
                <a
                  href={current.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  Download
                </a>
                <button
                  type="button"
                  className="text-slate-600 text-sm"
                  onClick={() => setPreviewId(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <AttachmentPreview url={current.signedUrl} name={displayName(current)} />
          </div>
        </div>
      )}
    </details>
  )
}

