"use client";

import { saveEMI } from "@/app/actions/emi";
import { EMISchema, EMISchemaType } from "@/app/actions/types";
import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EMIForm() {
  const [opened, { close, toggle }] = useDisclosure(false);

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

  const onSubmit = async (data: EMISchemaType) => {
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : "",
      endDate: data.endDate ? new Date(data.endDate).toISOString() : "",
    };

    await saveEMIAction(formattedData);
  };

  return (
    <Dialog open={opened} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add New EMI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle>Create New EMI</DialogTitle>
          <DialogDescription>
            Enter the details for your new EMI plan.
          </DialogDescription>
        </DialogHeader>
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
                        type="number"
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
                        type="number"
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
                        type="number"
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
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                        type="number"
                        step="0.01"
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
