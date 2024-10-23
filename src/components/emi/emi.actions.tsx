import { EMI } from "@/app/actions/types";
import { Row } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export const EMIActions = ({ row }: { row: Row<EMI> }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Info className="mr-2 h-4 w-4" />
        History
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{row.original.emiName} - Payment History</DialogTitle>
        <DialogDescription>
          Recent payment history for this EMI
        </DialogDescription>
      </DialogHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* {row.original.history
          .filter((history) => history.emiId === row.original.id)
          .map((history) => (
            <TableRow key={history.id}>
              <TableCell>{format(history.paymentDate, "PP")}</TableCell>
              <TableCell>${history.amountPaid.toFixed(2)}</TableCell>
            </TableRow>
          ))} */}
        </TableBody>
      </Table>
    </DialogContent>
  </Dialog>
);
