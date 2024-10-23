"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, Info } from "lucide-react";
import { DataTable } from "../data-table";
import { columns } from "./emi.config";
import { EMI } from "@/app/actions/types";

export default function EMIDashboard({ data }: { data: EMI[] }) {
  const getUpcomingEMIs = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return data.filter((emi) => {
      const dueDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        emi.monthlyDueDate
      );
      return dueDate > today && dueDate <= nextMonth;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">EMI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active EMIs</CardTitle>
            <CardDescription>
              Overview of your current EMI commitments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming EMIs</CardTitle>
              <CardDescription>EMIs due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {getUpcomingEMIs().map((emi) => (
                  <li
                    key={emi.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{emi.emiName}</p>
                      <p className="text-sm text-gray-500">
                        Due on {emi.monthlyDueDate}
                      </p>
                    </div>
                    <Button variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pay ₹{emi?.monthlyEmiAmount}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>EMI Overview</CardTitle>
              <CardDescription>Quick stats about your EMIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total EMI Amount</p>
                    <p className="text-2xl font-bold">
                      ₹
                      {data.reduce(
                        (sum, emi) => sum + (emi?.monthlyEmiAmount || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Active EMIs</p>
                    <p className="text-2xl font-bold">
                      {data.filter((emi) => emi.isActive).length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Earliest End Date</p>
                    <p className="text-xl font-bold"></p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Highest Interest Rate</p>
                    <p className="text-xl font-bold">
                      {Math.max(...data.map((emi) => emi.interestRate))}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
