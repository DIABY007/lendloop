"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getCategoryLabel, getConditionData, ToolCategory, ToolCondition } from "@/lib/constants";
import { ShieldCheck, Calendar, Lock, CheckCircle2, Clock, Trash2, Edit2 } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";

interface ToolCardProps {
  id: Id<"tools">;
  name: string;
  category: ToolCategory;
  condition: ToolCondition;
  description?: string;
  isAvailable: boolean;
  // Authenticated details (omitted on public page)
  ownerName?: string;
  ownerImageUrl?: string;
  isOwnerTrusted?: boolean;
  isCurrentUserOwner?: boolean;
  isAdmin?: boolean;
  isPublicView?: boolean;
  // Action callbacks
  onRequestBorrow?: (toolId: Id<"tools">, toolName: string) => void;
  onEdit?: (toolId: Id<"tools">) => void;
  onDelete?: (toolId: Id<"tools">) => void;
}

export function ToolCard({
  id,
  name,
  category,
  condition,
  description,
  isAvailable,
  ownerName,
  ownerImageUrl,
  isOwnerTrusted,
  isCurrentUserOwner,
  isAdmin,
  isPublicView = false,
  onRequestBorrow,
  onEdit,
  onDelete,
}: ToolCardProps) {
  const conditionData = getConditionData(condition);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div>
        <CardHeader className="p-5 pb-3">
          {/* Header Row: Category Tag & Status LED */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/90 font-medium">
              {getCategoryLabel(category)}
            </span>

            {/* Status Indicator */}
            {isAvailable ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Available</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span>On Loan</span>
              </div>
            )}
          </div>

          {/* Tool Title */}
          <h3 className="font-bold text-lg leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {name}
          </h3>

          {/* Description (hidden or truncated) */}
          {description && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="px-5 py-2">
          {/* Tool Condition Gauge */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs">
            <span className="text-muted-foreground font-medium">Condition</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-[11px]">
                {conditionData.label}
              </span>
              {/* Visual 3-bar gauge */}
              <div className="flex gap-0.5" title={conditionData.description}>
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`h-2.5 w-1 rounded-xs transition-colors ${
                      bar <= conditionData.bars
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Owner details or Privacy Shield */}
          <div className="mt-3.5 flex items-center justify-between text-xs">
            {isPublicView ? (
              <div
                className="flex items-center gap-1.5 text-muted-foreground/75 font-mono text-[11px]"
                title="Identity shielded for privacy in public catalog"
              >
                <Lock className="size-3 text-primary/70" />
                <span>Identity protected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted border border-border/60 text-[10px] font-semibold text-foreground">
                  {ownerName?.charAt(0).toUpperCase() || "N"}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground truncate max-w-[120px]">
                    {ownerName || "Neighbor"}
                  </span>
                  {isOwnerTrusted && (
                    <span title="Trusted Lender verified">
                      <ShieldCheck className="size-3.5 text-emerald-400" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {isCurrentUserOwner && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Your Listing
              </Badge>
            )}
          </div>
        </CardContent>
      </div>

      {/* Card Footer Actions */}
      <CardFooter className="p-5 pt-3 border-t border-border/40 mt-3 flex items-center justify-between gap-2">
        {isPublicView ? (
          <div className="w-full text-center py-1">
            <span className="text-[11px] text-muted-foreground/70 font-mono">
              Sign in to request
            </span>
          </div>
        ) : isCurrentUserOwner ? (
          <div className="flex items-center justify-end w-full gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(id)}
                className="h-8 gap-1.5 text-xs active:scale-[0.98]"
              >
                <Edit2 className="size-3" />
                <span>Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 active:scale-[0.98]"
              >
                <Trash2 className="size-3" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="h-8 px-2 text-destructive hover:bg-destructive/10 text-xs active:scale-[0.98]"
                title="Admin: Remove this listing"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}

            {isAvailable ? (
              <Button
                size="sm"
                disabled={!isAvailable}
                onClick={() => onRequestBorrow?.(id, name)}
                className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs h-9 shadow-sm active:scale-[0.98] transition-transform"
              >
                <Calendar className="size-3.5" />
                <span>Borrow This Tool</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full text-xs h-9 opacity-60 font-mono"
              >
                Currently on loan
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
