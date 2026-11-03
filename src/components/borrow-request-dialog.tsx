"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Loader2 } from "lucide-react";

interface BorrowRequestDialogProps {
  toolId: Id<"tools"> | null;
  toolName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorrowRequestDialog({
  toolId,
  toolName,
  open,
  onOpenChange,
}: BorrowRequestDialogProps) {
  const createRequest = useMutation(api.borrowRequests.createBorrowRequest);

  const today = new Date().toISOString().split("T")[0];
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(inThreeDays);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolId) return;

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Return date must be equal to or after the start date.");
      return;
    }

    setIsSubmitting(true);

    const promise = createRequest({
      toolId,
      startDate,
      endDate,
    });

    toast.promise(promise, {
      loading: "Submitting borrow request...",
      success: () => {
        onOpenChange(false);
        return "Request dispatched! The owner has been notified via n8n automation.";
      },
      error: (err) => `Failed to request tool: ${err.message || err}`,
    });

    try {
      await promise;
    } catch {
      // Handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/25 p-1 shrink-0">
              <Image
                src="/Logo.png"
                alt="LendLoop logo"
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </div>
            <span>Request to Borrow</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Requesting: <strong className="text-foreground">{toolName}</strong>
            <br />
            Select the planned borrowing period. The lender will review and confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs font-semibold">
                Start Date *
              </Label>
              <Input
                id="start-date"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs font-semibold">
                Planned Return Date *
              </Label>
              <Input
                id="end-date"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary" />
              Automated Community Courtesy
            </p>
            <p className="text-xs leading-relaxed">
              Our automated system (via n8n) will alert the owner right away and send you a timely return reminder the day before.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <span>Confirm Borrow Request</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
