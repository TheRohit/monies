import { EMIData, extractEMIDataAction } from "@/app/actions/extract-emi-data";
import { parsePDFAction } from "@/app/actions/parse-pdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDisclosure } from "@/hooks/use-disclosure";

import { UploadCloud } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function UploadModal({
  maxSize,
  setEMIData,
}: {
  setEMIData: (emiData: EMIData) => void;
  maxSize?: number;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    executeAsync: extractEMIData,
    isPending: isExtractingEMIDataPending,
  } = useAction(extractEMIDataAction, {
    onSuccess: (data) => {
      if (data.data) {
        setEMIData(data.data);
      }
      toast.success("EMI data extracted successfully");
      close();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Something went wrong");
    },
  });

  const { executeAsync, isPending } = useAction(parsePDFAction, {
    onSuccess: async (data) => {
      if (data.data?.parsedText) {
        await extractEMIData({ parsedPdf: data.data.parsedText });
      }
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Something went wrong");
    },
  });

  const [opened, { close, toggle }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      setSelectedFile(acceptedFiles[0]);
    } else {
      toast.error("Please select only one PDF file.");
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await executeAsync({ file: selectedFile, password });
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

  const onOpenChange = () => {
    toggle();
    setTimeout(() => {
      setSelectedFile(null);
    }, 100);
  };
  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file to get started.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" action={handleUpload}>
          <div className="flex flex-col gap-4">
            <div>
              <label
                {...getRootProps()}
                className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <div className="text-center">
                  <div className="border p-2 rounded-md max-w-min mx-auto dark:border-gray-600">
                    <UploadCloud
                      size={20}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  </div>

                  {selectedFile ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{selectedFile.name}</span>
                    </p>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">
                          Drag and drop a PDF file
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to select a file (file should be under 2 MB)
                      </p>
                    </>
                  )}
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
            {!selectedFile && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Enter password (Optional)</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              isLoading={isPending || isExtractingEMIDataPending}
              disabled={selectedFile === null}
              type="submit"
            >
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
