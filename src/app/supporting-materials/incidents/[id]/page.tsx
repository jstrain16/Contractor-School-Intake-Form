"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Slot = {
  id: string
  slot_code: string
  status: string
}

type FileRow = {
  id: string
  system_filename: string
  version: number
  uploaded_at?: string
  is_active: boolean
}

async function uploadFile(slotId: string, file: File) {
  const uploadReq = await fetch(`/api/slots/${slotId}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type }),
  })
  if (!uploadReq.ok) throw new Error("Failed to get upload URL")
  const uploadJson = await uploadReq.json()

  const putRes = await fetch(uploadJson.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })
  if (!putRes.ok) throw new Error("Upload failed")

  const completeRes = await fetch(`/api/slots/${slotId}/complete-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: uploadJson.path,
      systemFilename: uploadJson.systemFilename,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      version: uploadJson.version,
    }),
  })
  if (!completeRes.ok) throw new Error("Failed to finalize upload")
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [files, setFiles] = useState<Record<string, FileRow[]>>({})
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const resSlots = await fetch(`/api/incidents/${params.id}/slots`, { cache: "no-store" })
      const jsonSlots = await resSlots.json()
      setSlots(jsonSlots.slots ?? [])

      const grouped: Record<string, FileRow[]> = {}
      for (const slot of jsonSlots.slots ?? []) {
        const resFiles = await fetch(`/api/slots/${slot.id}/files`, { cache: "no-store" })
        const jsonFiles = await resFiles.json()
        grouped[slot.id] = jsonFiles.files ?? []
      }
      setFiles(grouped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const handleUpload = async (slotId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    try {
      await uploadFile(slotId, file)
      await refresh()
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    }
  }

  if (loading) return <div className="p-6">Loading incident…</div>

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Incident Details</h1>
          <p className="text-sm text-slate-600">Upload documents for this incident.</p>
        </div>

        <div className="grid gap-4">
          {slots.map((slot) => {
            const slotFiles = files[slot.id] ?? []
            const activeFile = slotFiles.find((f) => f.is_active)
            return (
              <Card key={slot.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{slot.slot_code}</CardTitle>
                  <span className="text-xs text-slate-500 capitalize">{slot.status}</span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-700">
                    {activeFile ? (
                      <div className="space-y-1">
                        <div>Current: {activeFile.system_filename} (v{activeFile.version})</div>
                        <div className="text-xs text-slate-500">
                          Uploaded {activeFile.uploaded_at ? new Date(activeFile.uploaded_at).toLocaleString() : ""}
                        </div>
                      </div>
                    ) : (
                      <span>No file uploaded</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => handleUpload(slot.id, e.target.files)} />
                    <Button variant="outline" onClick={() => refresh()}>
                      Refresh
                    </Button>
                  </div>
                  {slotFiles.length > 0 && (
                    <div className="text-xs text-slate-500">
                      History:{" "}
                      {slotFiles.map((f) => `v${f.version}${f.is_active ? " (active)" : ""}`).join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

