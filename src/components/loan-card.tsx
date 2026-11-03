"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Id } from "@convex/_generated/dataModel";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BellRing,
  AlertTriangle,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AutomationLogEntry {
  _id: string;
  type: "notification" | "reminder";
  message: string;
  sentAt: number;
}

interface LoanCardProps {
  requestId: Id<"borrowRequests">;
  toolName: string;
  toolCategory: string;
  status: "pending" | "approved" | "declined" | "returned" | "overdue";
  startDate: string;
  endDate: string;
  requestedAt: number;
  // Contextual participant details
  counterpartLabel: "Owner" | "Borrower";
  counterpartName: string;
  counterpartEmail?: string;
  counterpartImageUrl?: string;
  // Recent automation logs (Bonus)
  automationLogs?: AutomationLogEntry[];
  // Actions
  isIncoming?: boolean;
  onApprove?: (requestId: Id<"borrowRequests">) => void;
  onDecline?: (requestId: Id<"borrowRequests">) => void;
  onMarkReturned?: (requestId: Id<"borrowRequests">) => void;
}

export function LoanCard({
  requestId,
  toolName,
  toolCategory,
  status,
  startDate,
  endDate,
  requestedAt,
  counterpartLabel,
  counterpartName,
  counterpartEmail,
  automationLogs = [],
  isIncoming = false,
  onApprove,
  onDecline,
  onMarkReturned,
}: LoanCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-[11px] gap-1.5"
          >
            <Clock className="size-3 animate-spin" />
            <span>Pending Review</span>
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-[11px] gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Loan</span>
          </Badge>
        );
      case "overdue":
        return (
          <Badge
            variant="outline"
            className="border-red-500/40 bg-red-500/10 text-red-400 font-mono text-[11px] gap-1.5 animate-pulse"
          >
            <AlertTriangle className="size-3" />
            <span>Overdue Return</span>
          </Badge>
        );
      case "declined":
        return (
          <Badge
            variant="outline"
            className="border-destructive/40 bg-destructive/10 text-destructive font-mono text-[11px] gap-1.5"
          >
            <XCircle className="size-3" />
            <span>Declined</span>
          </Badge>
        );
      case "returned":
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground/30 bg-muted/30 text-muted-foreground font-mono text-[11px] gap-1.5"
          >
            <CheckCircle2 className="size-3 text-emerald-500/80" />
            <span>Returned</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden border border-border/80 bg-card rounded-xl transition-all duration-200 hover:border-primary/30">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {toolCategory.replace("_", " ")}
          </span>
          {getStatusBadge()}
        </div>

        <h3 className="font-bold text-base text-foreground tracking-tight">
          {toolName}
        </h3>
      </CardHeader>

      <CardContent className="px-5 py-2 space-y-3">
        {/* Date range details */}
        <div className="flex items-center justify-between text-xs rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>Loan Period:</span>
          </div>
          <div className="font-mono font-medium text-foreground tabular-nums text-xs">
            {startDate} → {endDate}
          </div>
        </div>

        {/* Counterpart info */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <User className="size-3 text-muted-foreground" />
            {counterpartLabel}:
          </span>
          <div className="text-right">
            <span className="font-medium text-foreground">{counterpartName}</span>
            {counterpartEmail && (
              <span className="block text-[10px] text-muted-foreground/80 font-mono">
                {counterpartEmail}
              </span>
            )}
          </div>
        </div>

        {/* Automation logs trail (Bonus) */}
        {automationLogs && automationLogs.length > 0 && (
          <div className="rounded-lg border border-border/40 bg-muted/30 p-2.5 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary font-semibold uppercase tracking-wider">
              <BellRing className="size-3" />
              <span>Automation Activity (n8n)</span>
            </div>
            {automationLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between text-muted-foreground text-[11px] font-mono"
              >
                <span className="truncate max-w-[200px] text-foreground/80">
                  {log.message}
                </span>
                <span className="text-[10px] text-muted-foreground/70 shrink-0">
                  {formatDistanceToNow(log.sentAt, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Card Actions for Lender */}
      {isIncoming && (
        <CardFooter className="p-5 pt-3 border-t border-border/40 mt-2 flex items-center justify-end gap-2">
          {status === "pending" && (
            <>
              {onDecline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDecline(requestId)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 active:scale-[0.98]"
                >
                  <XCircle className="size-3.5 mr-1" />
                  Decline
                </Button>
              )}
              {onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(requestId)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium active:scale-[0.98]"
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  Approve Request
                </Button>
              )}
            </>
          )}

          {(status === "approved" || status === "overdue") && onMarkReturned && (
            <Button
              size="sm"
              onClick={() => onMarkReturned(requestId)}
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium active:scale-[0.98] w-full sm:w-auto"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Mark as Returned
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
