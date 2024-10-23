"use client";

import FileUpload from "@/components/file-upload";
import EMIForm from "@/components/home/add-emi";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { extractEMIDataAction } from "../actions/extract-emi-data";
import { UploadModal } from "@/components/upload-modal";

export default function Page() {
  const { toast } = useToast();
  const [parsedText, setParsedText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setOpen(() => {
      return false;
    });
    toast({
      variant: "default",
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
    setLoading(true);
  };
  const handleParsedText = async (text: string) => {
    setParsedText(text);
    const res = await extractEMIDataAction({ parsedPdf: text });
    console.log(res?.data);
    setLoading(false);
  };
  return (
    <div>
      {/* <EMIForm /> */}
      <UploadModal
        onFileUpload={handleFileUpload}
        setParsedText={handleParsedText}
      />
    </div>
  );
}
