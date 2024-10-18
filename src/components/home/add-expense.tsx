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
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
    <div className="flex flex-col w-full bg-white dark:bg-zinc-900 h-full">
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

      <div className="flex-1 overflow-y-auto">
        {expenses?.length > 0 || isLoading ? (
          <div className="flex flex-col gap-2 items-center">
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
      </div>
    </div>
  );
}

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
