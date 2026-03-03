"use client"

import { useState, useCallback } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { FileText, Upload, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UploadZone() {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setError(null)
        setUploadSuccess(false)

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0]
            if (rejection.errors[0]?.code === "file-invalid-type") {
                setError("Only PDF and DOCX files are supported.")
            } else if (rejection.errors[0]?.code === "file-too-large") {
                setError("File size cannot exceed 5MB.")
            } else {
                setError(rejection.errors[0]?.message || "File rejected.")
            }
            return
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 1,
    })

    const removeFile = () => {
        setFile(null)
        setError(null)
        setUploadSuccess(false)
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setError(null)

        try {
            // 1. Get presigned URL from our API
            const res = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to get upload URL")
            }

            const { url } = await res.json()

            // 2. Upload file directly to S3
            const uploadRes = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!uploadRes.ok) throw new Error("Failed to upload file to storage")

            setUploadSuccess(true)
            console.log("File successfully uploaded to S3!")

            // TODO: Here we could trigger a parsing job or redirect to a wait page

        } catch (err: any) {
            console.error(err)
            setError(err.message || "An unexpected error occurred during upload.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto mt-8">
            {!file ? (
                <div
                    {...getRootProps()}
                    className={`relative overflow-hidden group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 ${isDragActive
                        ? "border-fire-orange bg-fire-orange/10 scale-[1.02]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className={`p-4 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-fire-orange/20 text-fire-orange' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}>
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-white mb-1">
                            {isDragActive ? "Drop it like it's hot!" : "Drag & drop your resume"}
                        </p>
                        <p className="text-sm text-zinc-400">
                            or click to browse local files (PDF, DOCX)
                        </p>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-2">Maximum file size: 5MB</div>
                </div>
            ) : (
                <div className="glass-card border-white/20 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-fire-red/20 text-fire-orange rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">
                                    {file.name}
                                </span>
                                <span className="text-xs text-zinc-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            disabled={isUploading || uploadSuccess}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || uploadSuccess}
                        variant="default"
                        className={`w-full h-12 text-lg font-bold transition-all duration-300 ${uploadSuccess ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/50' : 'magnetic-btn'}`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Uploaded Successfully
                            </>
                        ) : (
                            "Roast My Resume 🔥"
                        )}
                    </Button>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    )
}
