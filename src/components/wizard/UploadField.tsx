"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useWizardStore } from "@/store/wizard-store"

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
  const storeApplicationId = useWizardStore((s) => s.applicationId)
  const setStoreApplicationId = useWizardStore((s) => s.setApplicationId)
  const [resolvedAppId, setResolvedAppId] = useState<string | null>(applicationId ?? storeApplicationId ?? null)

  useEffect(() => {
    setResolvedAppId(applicationId ?? storeApplicationId ?? null)
  }, [applicationId, storeApplicationId])

  const ensureApplicationId = async (): Promise<string | null> => {
    if (resolvedAppId) return resolvedAppId
    try {
      const res = await fetch("/api/application", { method: "GET", cache: "no-store", credentials: "include" })
      if (!res.ok) throw new Error("Could not initialize application")
      const json = await res.json()
      const newId = json.applicationId as string | null
      if (newId) {
        setResolvedAppId(newId)
        setStoreApplicationId(newId)
        return newId
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not initialize application"
      setError(message)
    }
    return null
  }

  useEffect(() => {
    const loadExisting = async () => {
      if (!resolvedAppId) return
      setLoadingExisting(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          applicationId: resolvedAppId,
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
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Could not load existing attachment"
        setError(message)
      } finally {
        setLoadingExisting(false)
      }
    }
    loadExisting()
  }, [resolvedAppId, step, fileType])

  const handleFile = async (file?: File | null) => {
    if (!file) return
    const appId = await ensureApplicationId()
    if (!appId) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("step", String(step))
      fd.append("fileType", fileType)
      fd.append("applicationId", appId)
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed"
      setError(message)
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
          disabled={uploading}
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
        {!resolvedAppId && (
          <div className="text-xs text-amber-700">
            Waiting for application to initialize. Uploading will create it automatically.
          </div>
        )}
      </div>
    </div>
  )
}


