"use client";

import { EMI } from "@/app/actions/types";
import { ColumnDef } from "@tanstack/react-table";
import { Progress } from "../ui/progress";
import { EMIActions } from "./emi.actions";

export const columns: ColumnDef<EMI>[] = [
  {
    accessorKey: "emiName",
    header: "Name",
  },
  {
    accessorKey: "monthlyEmiAmount",
    header: "Monthly Amount",
    cell: ({ row }) => <div>₹{row?.original?.monthlyEmiAmount}</div>,
  },
  {
    accessorKey: "monthlyDueDate",
    header: "Due Date",
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <Progress
        value={calculateProgress(
          row?.original?.totalAmount,
          row?.original?.remainingAmount
        )}
        className="w-[60%]"
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <EMIActions row={row} />,
  },
];

const calculateProgress = (total: number, remaining: number) => {
  return ((total - remaining) / total) * 100;
};
