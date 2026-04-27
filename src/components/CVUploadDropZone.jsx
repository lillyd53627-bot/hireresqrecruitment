import React, { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CVUploadDropzone({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = async (files) => {
    if (!files.length) return;

    setUploading(true);
    setProgress(0);

    let uploadedCandidates = [];

    try {
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.name}`;

        // 1. Upload
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // 2. Get URL
        const { data: urlData } = supabase
          .storage
          .from('cvs')
          .getPublicUrl(fileName);

        const fileUrl = urlData.publicUrl;

        // 3. Parse CV
        const { data, error } = await supabase.functions.invoke('parse-cv', {
          body: { file_url: fileUrl }
        });

        if (error) {
          console.error("Parse error:", error);
          continue;
        }

        if (data?.candidate) {
          uploadedCandidates.push(data.candidate);
        }

        // Progress update
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      // ✅ SHOW RESULTS
      if (uploadedCandidates.length > 0) {
        toast.success(`${uploadedCandidates.length} CV(s) uploaded`);
        onUploadComplete(uploadedCandidates);
      } else {
        toast.error("No CVs were processed");
      }

    } catch (err) {
      console.error(err);
      toast.error("Bulk upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div
      className="border-2 border-dashed rounded-xl p-6 text-center hover:border-purple-500 transition"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        multiple
        className="hidden"
        id="bulk-upload"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <label htmlFor="bulk-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-3">

          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm">Uploading... {progress}%</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-purple-600" />
              <p className="font-medium">
                Drag & drop multiple CVs or click to upload
              </p>
              <p className="text-xs text-gray-400">
                Upload 1–20 CVs at once
              </p>
            </>
          )}

        </div>
      </label>
    </div>
  );
}