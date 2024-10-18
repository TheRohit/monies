"use client";

import { saveEMI } from "@/app/actions/emi";
import { EMISchema, EMISchemaType } from "@/app/actions/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

export default function EMIForm() {
  const { executeAsync, isPending, hasErrored } = useAction(saveEMI);

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

    const result = await executeAsync(formattedData);
    if (result) {
      toast({
        title: "EMI Saved",
        description: "Your EMI has been successfully saved.",
      });
      form.reset();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New EMI</CardTitle>
        <CardDescription>
          Enter the details for your new EMI plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save EMI"}
            </Button>
          </form>
        </Form>
        {hasErrored && <div>Error</div>}
      </CardContent>
    </Card>
  );
}
