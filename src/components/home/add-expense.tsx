/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Expense,
  expenseSchema,
  InputExpense,
  inputExpenseSchema,
  PartialExpense,
} from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { experimental_useObject as useObject } from "ai/react";
import { formatDate } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function AddExpense({ data }: { data: Expense[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(data);

  const handleOnSubmit = (data: InputExpense) => {
    if (data.expense.trim()) {
      submit({ expense: data.expense });
    }
  };

  const form = useForm<InputExpense>({
    resolver: zodResolver(inputExpenseSchema),
    defaultValues: {
      expense: "",
    },
  });

  const { submit, isLoading, object } = useObject({
    api: "/api/chat",
    schema: expenseSchema,
    onFinish({ object }) {
      const currentDateTime = new Date().toISOString();
      if (object != null) {
        const expense = {
          ...object.expense,
          date: currentDateTime,
        };
        setExpenses((prev) => [expense, ...prev]);
        form.reset();
        form.setFocus("expense");
      }
    },
    onError: () => {
      toast.error("You've been rate limited, please try again later!");
    },
  });

  return (
    <div className="overflow-hidden p-5 h-[calc(100vh-64px)] flex w-screen">
      <Tabs defaultValue="overview" className="h-full w-full space-y-6">
        <div className="space-between flex items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-2">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Expense Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <ExpenseOverview
                object={object}
                form={form}
                handleOnSubmit={handleOnSubmit}
                expenses={expenses}
                isLoading={isLoading}
              />
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Balance
                          </CardTitle>
                          {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">₹45,231.89</div>
                          <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Expenses
                          </CardTitle>
                          {/* <Receipt className="h-4 w-4 text-muted-foreground" /> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">₹3,352.40</div>
                          <p className="text-xs text-muted-foreground">
                            +4.5% from last month
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Income
                          </CardTitle>
                          {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">₹8,700.00</div>
                          <p className="text-xs text-muted-foreground">
                            +2.3% from last month
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Active Loans
                          </CardTitle>
                          {/* <CreditCard className="h-4 w-4 text-muted-foreground" /> */}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">3</div>
                          <p className="text-xs text-muted-foreground">
                            2 personal, 1 home loan
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4"></TabsContent>
      </Tabs>
    </div>
  );
}

const ExpenseOverview = ({
  form,
  handleOnSubmit,
  expenses,
  isLoading,
  object,
}: {
  form: UseFormReturn<InputExpense>;
  handleOnSubmit: (data: InputExpense) => void;
  expenses: Expense[];
  isLoading: boolean;
  object: any;
}) => {
  return (
    <div className="flex flex-col w-[500px] bg-white dark:bg-zinc-900 h-full rounded-lg p-3">
      <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)}>
            <FormField
              control={form.control}
              name="expense"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      id="expense"
                      type="text"
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="Expense a transaction..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <ScrollArea className="h-[440px] ">
        {expenses?.length > 0 || isLoading ? (
          <div className="flex flex-col gap-2 items-center ">
            {isLoading && object?.expense && (
              <div className="opacity-50">
                <ExpenseView expense={object.expense} />
              </div>
            )}

            {expenses?.map((expense) => (
              <ExpenseView
                key={`${expense.date}-${expense.details}`}
                expense={expense}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full items-center">
            <div className="text-zinc-400 dark:text-zinc-400">
              No expenses yet!
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none"></div>
      </ScrollArea>
    </div>
  );
};

const ExpenseView = ({ expense }: { expense: Expense | PartialExpense }) => {
  return (
    <motion.div
      className="flex flex-col gap-2 px-4 w-[500px]"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full ">
        <div className="flex-1 flex flex-row gap-2 items-center min-w-0">
          <div className="text-zinc-400 dark:text-zinc-400 shrink-0 w-16">
            {expense?.date && formatDate(expense.date, "dd MMM")}
          </div>
          <div className="text-zinc-800 dark:text-zinc-300 truncate capitalize">
            {expense?.details}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 sm:gap-4 justify-end">
          <div className="text-zinc-600 text-xs bg-zinc-200 rounded-md flex items-center p-1 font-medium capitalize h-fit dark:bg-zinc-700 dark:text-zinc-300 shrink-0">
            {expense?.category?.toLowerCase()}
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 w-20 text-right shrink-0">
            ₹{expense?.amount}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
