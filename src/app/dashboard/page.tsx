import AddExpense from "@/components/home/add-expense";
import { getExpensesForUser } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

export default async function HomeServer() {
  const userId = auth().userId;
  if (!userId) {
    return <div>Loading...</div>;
  }
  const expenses = await getExpensesForUser(userId);

  return (
    <AddExpense data={expenses} />
    // <div className="container w-full mx-auto px-4 py-8 flex justify-between">

    //   <div className="w-full max-w-[500px] h-[600px]"></div>
    // </div>
  );
}
