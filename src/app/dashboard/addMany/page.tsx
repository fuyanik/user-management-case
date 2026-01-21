"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useUsers } from "@/hooks/useUsers";
import type { ValidationErrorResponse } from "@/types";

export default function AddManyUsersPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    errors?: ValidationErrorResponse[];
    importedCount?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadExcel, isUploading } = useUsers();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      setUploadResult({
        success: false,
        message: "Please upload an Excel file (.xlsx or .xls)",
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadExcel(selectedFile);
      setUploadResult({
        success: true,
        message: result.message,
        importedCount: result.data?.imported,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      const err = error as Error & { errors?: ValidationErrorResponse[] };
      setUploadResult({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-[#0071e3] hover:text-[#0077ed] transition-colors mr-4 flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-xl font-semibold text-[#1d1d1f]">Import Users</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Upload result */}
            {uploadResult && (
              <Alert
                variant={uploadResult.success ? "success" : "error"}
                onClose={() => setUploadResult(null)}
              >
                <div>
                  <p className="font-medium">{uploadResult.message}</p>
                  {uploadResult.importedCount && (
                    <p className="text-sm mt-1 opacity-80">
                      {uploadResult.importedCount} users imported. Redirecting...
                    </p>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Errors found:</p>
                      <ul className="text-sm list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                        {uploadResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>
                            {error.row && `Row ${error.row}: `}
                            {error.field} - {error.message}
                          </li>
                        ))}
                        {uploadResult.errors.length > 10 && (
                          <li className="text-[#86868b]">...and {uploadResult.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </Alert>
            )}

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? "border-[#0071e3] bg-[#0071e3]/5" 
                  : "border-[#d2d2d7] hover:border-[#86868b] hover:bg-[#f5f5f7]"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center
                  ${isDragging ? "bg-[#0071e3]/10" : "bg-[#f5f5f7]"}
                `}>
                  <svg
                    className={`w-7 h-7 ${isDragging ? "text-[#0071e3]" : "text-[#86868b]"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[#1d1d1f] font-medium">
                    {isDragging ? "Drop your file here" : "Drop Excel file here"}
                  </p>
                  <p className="text-[#86868b] text-sm mt-1">
                    or click to browse
                  </p>
                </div>
              </div>
            </div>

            {/* Selected file */}
            {selectedFile && (
              <div className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#34c759]/10 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#34c759]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#1d1d1f] font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-[#86868b] text-xs">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    isLoading={isUploading}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-[#f5f5f7] rounded-xl p-5">
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">Required Columns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#86868b]">firstName</span>
                  <span className="text-[#1d1d1f]">Text <span className="text-[#ff3b30]">*</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">lastName</span>
                  <span className="text-[#1d1d1f]">Text <span className="text-[#ff3b30]">*</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">email</span>
                  <span className="text-[#1d1d1f]">Text, unique <span className="text-[#ff3b30]">*</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">age</span>
                  <span className="text-[#1d1d1f]">Number (1-150) <span className="text-[#ff3b30]">*</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">password</span>
                  <span className="text-[#1d1d1f]">Text (min 6 chars) <span className="text-[#ff3b30]">*</span></span>
                </div>
              </div>
              <p className="text-xs text-[#86868b] mt-3">
                <span className="text-[#ff3b30]">*</span> All fields are required
              </p>
              <p className="text-xs text-[#ff9500] mt-2">
                ⚠️ If any row has an error, no users will be imported.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
