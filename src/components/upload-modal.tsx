import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function UploadModal({
  onFileUpload,
  setParsedText,
  password,
  maxSize,
}: {
  onFileUpload: (file: File) => void;
  setParsedText: (text: string) => void;
  password?: string;
  maxSize?: number;
}) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadFileToApi = async (file: File) => {
    const formData = new FormData();
    formData.append("FILE", file);
    if (password) {
      formData.append("password", password);
    }

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const parsedText = await response.text();
      setParsedText(parsedText);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: (error as Error).message,
      });
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      setSelectedFile(acceptedFiles[0]);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file selection",
        description: "Please select only one PDF file.",
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      await uploadFileToApi(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF file before uploading.",
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: maxSize,
    multiple: false,
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file to get started.</DialogDescription>
        </DialogHeader>
        <div>
          <div>
            <label
              {...getRootProps()}
              className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="text-center">
                <div className="border p-2 rounded-md max-w-min mx-auto dark:border-gray-600">
                  <UploadCloud
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">
                    Drag and drop a PDF file
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click to select a file (file should be under 8 MB)
                </p>
              </div>
            </label>
            <Input
              {...getInputProps()}
              id="dropzone-file"
              accept="application/pdf"
              type="file"
              className="hidden"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} type="submit">
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
