"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  url: string | null
  name: string
  onClose: () => void
}

function isPdf(name: string) {
  return /\.pdf$/i.test(name)
}

function isImage(name: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
}

export function AttachmentPreview({ url, name, onClose }: Props) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setErrored(false), 0)
    return () => clearTimeout(timeout)
  }, [url, name])

  if (!url) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-rose-600">Preview unavailable (no signed URL).</div>
        <div className="text-xs text-slate-500">Try downloading instead.</div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  const showPdf = isPdf(name)
  const showImg = isImage(name)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-900 text-sm">{name}</div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {errored && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Preview failed. Please download instead.
        </div>
      )}

      {!errored && showImg && (
        <div className="max-h-[70vh] overflow-auto rounded-md border bg-slate-50 p-2">
      <img
        src={url}
        alt={name}
        className="max-h-[65vh] w-auto object-contain"
        onError={() => setErrored(true)}
      />
        </div>
      )}

      {!errored && showPdf && (
        <div className="h-[70vh] overflow-hidden rounded-md border bg-white">
          <iframe
            src={url}
            title={name}
            className="h-full w-full"
            onError={() => setErrored(true)}
          />
        </div>
      )}

      {!showImg && !showPdf && !errored && (
        <div className="text-sm text-slate-700">
          Preview not supported for this file type. Please download.
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-sm underline"
        >
          Download
        </a>
      </div>
    </div>
  )
}

