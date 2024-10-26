import EMIDashboard from "@/components/emi/emi-dashboard";
import { getEMIsForUser } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    return;
  }
  const emis = await getEMIsForUser(userId);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="overflow-hidden p-5 h-[calc(100vh-64px)] flex">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <EMIDashboard data={emis as any} />
      </div>
    </Suspense>
  );
}
