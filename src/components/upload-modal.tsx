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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDisclosure } from "@/hooks/use-disclosure";
import { UploadCloud } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

import { saveEMI } from "@/app/actions/emi";
import { EMISchema, EMISchemaType } from "@/app/actions/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DatePickerField } from "./ui/date-picker-field";

export function UploadModal({
  maxSize,
  setEMIData,
}: {
  setEMIData: (emiData: EMIData) => void;
  maxSize?: number;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [opened, { close, toggle }] = useDisclosure(false);
  const [password, setPassword] = useState("");

  const form = useForm<EMISchemaType>({
    resolver: zodResolver(EMISchema),
    defaultValues: {
      emiName: "",
      totalAmount: 0,
      amountPaid: 0,
      monthlyEmiAmount: 0,
      monthlyDueDate: 1,
      startDate: "",
      endDate: "",
      interestRate: 0,
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      setSelectedFile(acceptedFiles[0]);
    } else {
      toast.error("Please select only one PDF file.");
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

  const {
    executeAsync: extractEMIData,
    isPending: isExtractingEMIDataPending,
  } = useAction(extractEMIDataAction, {
    onSuccess: (data) => {
      if (data.data) {
        setEMIData(data.data);
        form.reset({
          amountPaid: data.data.principalPaid,
          monthlyEmiAmount: data.data.monthlyEmiAmount,
          monthlyDueDate: data.data.monthlyDueDate,
          totalAmount: data.data.totalAmount,
          emiName: data.data.emiName,
          startDate: data.data.startDate,
          endDate: data.data.endDate,
          interestRate: data.data.interestRate,
        });
      }
      toast.success("EMI data extracted successfully");
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

  const handleUpload = async () => {
    if (selectedFile) {
      await executeAsync({ file: selectedFile, password });
    }
  };

  const onOpenChange = () => {
    toggle();
    setTimeout(() => {
      setSelectedFile(null);
    }, 100);
  };

  const {
    executeAsync: saveEMIAction,
    isPending: isSavingEMI,
    hasErrored: isSavingEMIError,
  } = useAction(saveEMI, {
    onSuccess: () => {
      toast.success("EMI saved successfully");
      form.reset();
      close();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Something went wrong");
    },
  });

  const onSubmit = async (data: EMISchemaType) => {
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : "",
      endDate: data.endDate ? new Date(data.endDate).toISOString() : "",
    };

    await saveEMIAction(formattedData);
  };

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[60%] ">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file to get started.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 w-full  ">
          <div className="w-1/3 items-start justify-center p-1">
            <form
              className="flex flex-col gap-4 justify-center h-full"
              action={handleUpload}
            >
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
                        <span className="font-semibold">
                          {selectedFile.name}
                        </span>
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
              <Button
                variant="outline"
                isLoading={isPending || isExtractingEMIDataPending}
                disabled={selectedFile === null}
                type="submit"
              >
                Autofill
              </Button>
            </form>
          </div>

          <div className="w-2/3">
            <ScrollArea className="h-[60vh]">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2 p-3"
                >
                  <FormField
                    control={form.control}
                    name="emiName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EMI Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter EMI name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter total amount"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter amount paid"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyEmiAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly EMI Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter monthly EMI amount"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyDueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter monthly due date (1-31)"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <DatePickerField label="Start Date" field={field} />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <DatePickerField label="End Date" field={field} />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter interest rate"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={isSavingEMI}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSavingEMI ? "Saving..." : "Save EMI"}
          </Button>
        </DialogFooter>
        {isSavingEMIError && <div>Error</div>}
      </DialogContent>
    </Dialog>
  );
}
