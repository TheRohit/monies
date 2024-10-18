import AddExpense from "@/components/home/add-expense";
import { getExpensesForUser } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";

export default async function HomeServer() {
  const userId = auth().userId;
  if (!userId) {
    return <div>Loading...</div>;
  }
  const expenses = await getExpensesForUser(userId);

  const formattedExpenses = expenses.map((expense) => ({
    ...expense,
    date: format(expense.date, "dd MMM"),
  }));

  return (
    <div className="container mx-auto px-4 py-8 flex justify-between">
      <div className="w-full max-w-[600px] h-[220px] relative overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-md">
        <div className="absolute inset-0 p-2  overflow-y-auto">
          <AddExpense data={formattedExpenses} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none"></div>
      </div>
      <div className="w-full max-w-[500px] h-[600px]"></div>
    </div>
  );
}
