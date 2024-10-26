import Link from "next/link";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="flex h-16 items-center px-4">
      <nav
        className={cn(
          "flex items-center space-x-4 lg:space-x-6 mx-6",
          className
        )}
        {...props}
      >
        <Link
          href="/dashboard"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Overview
        </Link>
        <Link
          href="/emi"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          EMI
        </Link>
        <Link
          href="/examples/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Products
        </Link>
        <Link
          href="/settings"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Settings
        </Link>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <UserButton />
      </div>
    </div>
  );
}
