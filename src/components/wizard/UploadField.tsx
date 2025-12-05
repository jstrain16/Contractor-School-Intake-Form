"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type UploadFieldProps = {
  label: string
  step: number
  fileType: string
  applicationId?: string | null
  accept?: string
}

const BUCKET = "contractor-documents"

export function UploadField({ label, step, fileType, applicationId, accept }: UploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(false)

  useEffect(() => {
    const loadExisting = async () => {
      if (!applicationId) return
      setLoadingExisting(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          applicationId,
          step: String(step),
          fileType,
        })
        const res = await fetch(`/api/attachments?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load existing attachment")
        const json = await res.json()
        const latest = json.attachments?.[0]
        if (latest) {
          setUploadedName(latest.metadata?.originalName ?? latest.path)
          setUploadedPath(latest.path)
        } else {
          setUploadedName(null)
          setUploadedPath(null)
        }
      } catch (e: any) {
        setError(e?.message || "Could not load existing attachment")
      } finally {
        setLoadingExisting(false)
      }
    }
    loadExisting()
  }, [applicationId, step, fileType])

  const handleFile = async (file?: File | null) => {
    if (!file) return
    if (!applicationId) {
      setError("Application not ready yet. Please wait a moment or refresh.")
      return
    }
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("step", String(step))
      fd.append("fileType", fileType)
      fd.append("applicationId", applicationId)
      const res = await fetch("/api/upload-attachment", {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Upload failed")
      }
      const json = await res.json()
      setUploadedName(file.name)
      setUploadedPath(json.attachment?.path ?? null)
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!uploadedPath) return
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(uploadedPath, 60 * 60) // 1 hour
    if (error || !data?.signedUrl) {
      setError(error?.message || "Could not generate download link")
      return
    }
    window.open(data.signedUrl, "_blank", "noreferrer")
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={uploading}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || !applicationId}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadedName ? "Replace document" : "Upload document"}
        </Button>
        {uploadedName && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">Uploaded:</span>
            <span>{uploadedName}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || !uploadedPath}
            onClick={() => handleDownload()}
          >
            Download document
          </Button>
        </div>
        {loadingExisting && <div className="text-xs text-slate-500">Loading attachment...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!applicationId && (
          <div className="text-xs text-amber-700">
            Waiting for application to initialize. Save or refresh, then try again.
          </div>
        )}
      </div>
    </div>
  )
}


