import React from "react";

import { getExpensesForUser } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import HomeClient from "@/components/home/home.client";

export default async function HomeServer() {
  const userId = auth().userId;
  const expenses = await getExpensesForUser(userId);
  return (
    <div>
      <HomeClient initialExpenses={expenses} />
    </div>
  );
}
