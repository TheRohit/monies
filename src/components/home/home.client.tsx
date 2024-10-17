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
import { experimental_useObject } from "ai/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function HomeClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  const { submit, isLoading, object } = experimental_useObject({
    api: "/api/chat",
    schema: expenseSchema,
    onFinish({ object }) {
      if (object != null) {
        setExpenses((prev) => [object.expense, ...prev]);
        form.reset();
        form.setFocus("expense");
      }
    },
    onError: () => {
      toast.error("You've been rate limited, please try again later!");
    },
  });

  return (
    <div className="flex flex-row justify-center pt-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <Form {...form}>
          <form
            className="flex flex-col gap-2 relative items-center"
            onSubmit={form.handleSubmit(handleOnSubmit)}
          >
            <FormField
              control={form.control}
              name="expense"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)] disabled:text-zinc-400 disabled:cursor-not-allowed placeholder:text-zinc-400"
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

        {expenses?.length > 0 || isLoading ? (
          <div className="flex flex-col gap-2 h-full w-dvw items-center">
            {isLoading && object?.expense && (
              <div className="opacity-50">
                <ExpenseView expense={object.expense} />
              </div>
            )}

            {expenses?.map((expense) => (
              <ExpenseView key={`${expense.details}`} expense={expense} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full w-dvw items-center">
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
      className={`flex flex-row gap-2 px-4 w-full md:w-[500px] md:px-0`}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-row gap-4 w-full">
        <div className="text-zinc-400 dark:text-zinc-400 w-16">
          {expense?.date}
        </div>
        <div className="text-zinc-800 dark:text-zinc-300 flex-1 capitalize flex flex-row gap-2 items-center">
          <div>{expense?.details}</div>
          <div className="flex flex-row gap-2 size-6"></div>
        </div>
        <div className="text-zinc-600 dark:text-zinc-300 text-xs bg-zinc-200 rounded-md flex flex-row items-center p-1 font-medium capitalize h-fit dark:bg-zinc-700 dark:text-zinc-300">
          {expense?.category?.toLowerCase()}
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 w-8 text-right">
          ${expense?.amount}
        </div>
      </div>
    </motion.div>
  );
};
