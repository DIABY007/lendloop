"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CONDITIONS, ToolCategory, ToolCondition } from "@/lib/constants";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToolDialog({ open, onOpenChange }: AddToolDialogProps) {
  const createTool = useMutation(api.tools.createTool);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategory>("power_tools");
  const [condition, setCondition] = useState<ToolCondition>("good");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tool name is required");
      return;
    }

    setIsSubmitting(true);

    const promise = createTool({
      name: name.trim(),
      category,
      condition,
      description: description.trim(),
    });

    toast.promise(promise, {
      loading: "Adding your equipment to the neighborhood board...",
      success: () => {
        setName("");
        setDescription("");
        onOpenChange(false);
        return "Tool listed successfully! Your neighbors can now request it.";
      },
      error: (err) => `Failed to list tool: ${err.message || err}`,
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
            <span>List Equipment to Lend</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share your tools with verified neighbors. You will have full authority to approve or decline every borrow request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tool Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tool-name" className="text-xs font-semibold">
              Tool Name *
            </Label>
            <Input
              id="tool-name"
              placeholder="e.g. Cordless Hammer Drill 18V"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold">
                Category *
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as ToolCategory)}
              >
                <SelectTrigger id="category" className="h-9 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="condition" className="text-xs font-semibold">
                Condition *
              </Label>
              <Select
                value={condition}
                onValueChange={(val) => setCondition(val as ToolCondition)}
              >
                <SelectTrigger id="condition" className="h-9 text-xs">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond.id} value={cond.id} className="text-xs">
                      {cond.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description & Accessories
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. Includes 2 batteries, charger, and standard masonry bits. Clean before returning."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none min-h-[80px]"
            />
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
                  <span>Listing...</span>
                </>
              ) : (
                <span>Publish Listing</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
