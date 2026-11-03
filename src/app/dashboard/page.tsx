"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { ToolCard } from "@/components/tool-card";
import { LoanCard } from "@/components/loan-card";
import { AddToolDialog } from "@/components/add-tool-dialog";
import { BorrowRequestDialog } from "@/components/borrow-request-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, ToolCategory } from "@/lib/constants";
import { toast } from "sonner";
import {
  Compass,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Plus,
  ShieldCheck,
  Trash2,
  Inbox,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { isAuthenticated: isConvexAuth } = useConvexAuth();

  // Convex mutations & queries
  const ensureUser = useMutation(api.users.ensureUser);
  const currentUser = useQuery(api.users.getCurrentUser, isConvexAuth ? {} : "skip");
  const allTools = useQuery(api.tools.listAllTools, isConvexAuth ? {} : "skip");
  const myTools = useQuery(api.tools.listMyTools, isConvexAuth ? {} : "skip");
  const myRequests = useQuery(api.borrowRequests.listMyRequests, isConvexAuth ? {} : "skip");
  const incomingRequests = useQuery(api.borrowRequests.listIncomingRequests, isConvexAuth ? {} : "skip");
  const allLoansAdmin = useQuery(
    api.borrowRequests.listAllLoans,
    currentUser?.role === "admin" ? {} : "skip"
  );
  const allUsersAdmin = useQuery(
    api.users.listAllUsers,
    currentUser?.role === "admin" ? {} : "skip"
  );

  const approveRequest = useMutation(api.borrowRequests.approveRequest);
  const declineRequest = useMutation(api.borrowRequests.declineRequest);
  const markReturned = useMutation(api.borrowRequests.markReturned);
  const deleteTool = useMutation(api.tools.deleteTool);
  const adminRemoveTool = useMutation(api.tools.adminRemoveTool);
  const markTrustedLender = useMutation(api.users.markTrustedLender);
  const removeTrustedLender = useMutation(api.users.removeTrustedLender);

  // UI state
  const [activeTab, setActiveTab] = useState("all-tools");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [borrowModalData, setBorrowModalData] = useState<{
    open: boolean;
    toolId: Id<"tools"> | null;
    toolName: string;
  }>({
    open: false,
    toolId: null,
    toolName: "",
  });

  // Guarantee sync on login once Convex auth is ready
  useEffect(() => {
    if (isConvexAuth) {
      ensureUser().catch(console.error);
    }
  }, [isConvexAuth, ensureUser]);

  // Request borrow action
  const handleOpenBorrowModal = (toolId: Id<"tools">, toolName: string) => {
    setBorrowModalData({
      open: true,
      toolId,
      toolName,
    });
  };

  // Approve request
  const handleApprove = (requestId: Id<"borrowRequests">) => {
    const promise = approveRequest({ requestId });
    toast.promise(promise, {
      loading: "Approving loan & notifying neighbor...",
      success: "Request approved! The borrower has been notified.",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  // Decline request
  const handleDecline = (requestId: Id<"borrowRequests">) => {
    const promise = declineRequest({ requestId });
    toast.promise(promise, {
      loading: "Declining request...",
      success: "Request declined.",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  // Return loan
  const handleMarkReturned = (requestId: Id<"borrowRequests">) => {
    const promise = markReturned({ requestId });
    toast.promise(promise, {
      loading: "Marking loan as returned & restoring tool availability...",
      success: "Equipment marked as returned. Available for borrowing again!",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  // Delete tool
  const handleDeleteTool = (toolId: Id<"tools">) => {
    if (!confirm("Are you sure you want to remove this tool listing?")) return;
    const promise = deleteTool({ toolId });
    toast.promise(promise, {
      loading: "Removing listing...",
      success: "Tool listing removed.",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  // Admin delete
  const handleAdminDelete = (toolId: Id<"tools">) => {
    if (!confirm("Admin: Permanently delete this tool listing?")) return;
    const promise = adminRemoveTool({ toolId });
    toast.promise(promise, {
      loading: "Admin: Removing tool...",
      success: "Tool listing removed by admin.",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  // Admin toggle Trusted Lender
  const handleToggleTrusted = (userId: Id<"users">, currentStatus: boolean) => {
    const promise = currentStatus
      ? removeTrustedLender({ userId })
      : markTrustedLender({ userId });

    toast.promise(promise, {
      loading: "Updating lender certification...",
      success: currentStatus
        ? "Trusted Lender status revoked."
        : "Neighbor certified as Trusted Lender!",
      error: (err) => `Failed: ${err.message || err}`,
    });
  };

  const filteredAllTools = allTools?.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  const pendingIncomingCount =
    incomingRequests?.filter((r) => r.status === "pending").length || 0;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 w-full space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Package className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Sign In Required</h2>
          <p className="text-xs text-muted-foreground">
            You must be signed in with Clerk to access the authenticated tool board and manage borrow requests.
          </p>
          <div className="pt-2">
            <Link href="/sign-in">
              <Button className="bg-primary text-primary-foreground text-xs">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Neighborhood Tool Board
              </h1>
              {currentUser?.role === "admin" && (
                <Badge className="bg-primary/20 border-primary/40 text-primary font-mono text-xs">
                  Admin Mode
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome back, <strong className="text-foreground">{user?.firstName || "Neighbor"}</strong>. Manage your equipment and borrow requests below.
            </p>
          </div>

          <Button
            onClick={() => setIsAddToolOpen(true)}
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs h-9 shadow-sm active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>List an Equipment</span>
          </Button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40 p-1 border border-border/80 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="all-tools"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-medium py-2 px-3.5"
            >
              <Compass className="size-3.5" />
              <span>All Tools</span>
              {allTools && (
                <Badge variant="secondary" className="ml-1 text-xs h-4.5 px-1.5 font-mono">
                  {allTools.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="my-listings"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-medium py-2 px-3.5"
            >
              <Package className="size-3.5" />
              <span>My Listings</span>
              {myTools && (
                <Badge variant="secondary" className="ml-1 text-xs h-4.5 px-1.5 font-mono">
                  {myTools.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="my-requests"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-medium py-2 px-3.5"
            >
              <ArrowUpRight className="size-3.5" />
              <span>My Requests</span>
              {myRequests && (
                <Badge variant="secondary" className="ml-1 text-xs h-4.5 px-1.5 font-mono">
                  {myRequests.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="incoming-requests"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-medium py-2 px-3.5"
            >
              <ArrowDownLeft className="size-3.5" />
              <span>Incoming Requests</span>
              {pendingIncomingCount > 0 && (
                <Badge className="ml-1 bg-amber-500 text-black text-xs h-4.5 px-1.5 font-bold font-mono">
                  {pendingIncomingCount}
                </Badge>
              )}
            </TabsTrigger>

            {currentUser?.role === "admin" && (
              <TabsTrigger
                value="admin-panel"
                className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary font-medium py-2 px-3.5 border-l border-border/50 ml-auto"
              >
                <ShieldAlert className="size-3.5 text-primary" />
                <span>Admin Panel</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* =============================================================== */}
          {/* TAB 1: ALL TOOLS (With Category Filters & Borrow Dialog)         */}
          {/* =============================================================== */}
          <TabsContent value="all-tools" className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="h-8 text-xs font-medium rounded-full active:scale-[0.98]"
              >
                All Categories
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="h-8 text-xs font-medium rounded-full active:scale-[0.98] shrink-0"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {allTools === undefined ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : filteredAllTools && filteredAllTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAllTools.map((tool) => (
                  <ToolCard
                    key={tool._id}
                    id={tool._id}
                    name={tool.name}
                    category={tool.category}
                    condition={tool.condition}
                    description={tool.description}
                    isAvailable={tool.isAvailable}
                    ownerName={tool.ownerName}
                    ownerImageUrl={tool.ownerImageUrl}
                    isOwnerTrusted={tool.isOwnerTrusted}
                    isCurrentUserOwner={tool.ownerId === currentUser?._id}
                    isAdmin={currentUser?.role === "admin"}
                    onRequestBorrow={handleOpenBorrowModal}
                    onDelete={handleDeleteTool}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
                <Inbox className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No tools found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Try selecting another category or be the first to list equipment here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 2: MY LISTINGS                                              */}
          {/* =============================================================== */}
          <TabsContent value="my-listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Your Listed Tools</h2>
                <p className="text-xs text-muted-foreground">
                  Equipment you are currently offering to neighbors.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddToolOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Add another</span>
              </Button>
            </div>

            {myTools === undefined ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : myTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myTools.map((tool) => (
                  <ToolCard
                    key={tool._id}
                    id={tool._id}
                    name={tool.name}
                    category={tool.category}
                    condition={tool.condition}
                    description={tool.description}
                    isAvailable={tool.isAvailable}
                    isCurrentUserOwner={true}
                    onDelete={handleDeleteTool}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
                <Package className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold text-foreground">You haven&apos;t listed any tools</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Help out your community by listing power tools, lawn mowers, or camping gear you rarely use.
                </p>
                <Button
                  onClick={() => setIsAddToolOpen(true)}
                  size="sm"
                  className="mt-4 bg-primary text-primary-foreground text-xs"
                >
                  List your first tool
                </Button>
              </div>
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 3: MY REQUESTS (Borrowed Tools)                             */}
          {/* =============================================================== */}
          <TabsContent value="my-requests" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Your Borrow Requests</h2>
              <p className="text-xs text-muted-foreground">
                Track status updates and automated return reminders for equipment you requested.
              </p>
            </div>

            {myRequests === undefined ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : myRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {myRequests.map((req) => (
                  <LoanCard
                    key={req._id}
                    requestId={req._id}
                    toolName={req.toolName}
                    toolCategory={req.toolCategory}
                    status={req.status}
                    startDate={req.startDate}
                    endDate={req.endDate}
                    requestedAt={req.requestedAt}
                    counterpartLabel="Owner"
                    counterpartName={req.lenderName}
                    counterpartEmail={req.lenderEmail}
                    automationLogs={req.automationLogs}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
                <ArrowUpRight className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No active borrow requests</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse the catalog to find gear you need for your upcoming projects.
                </p>
              </div>
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 4: INCOMING REQUESTS (Requests on My Tools)                  */}
          {/* =============================================================== */}
          <TabsContent value="incoming-requests" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Incoming Borrow Requests</h2>
              <p className="text-xs text-muted-foreground">
                Review requests from neighbors for your equipment. Approve, decline, or mark loans as returned.
              </p>
            </div>

            {incomingRequests === undefined ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : incomingRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {incomingRequests.map((req) => (
                  <LoanCard
                    key={req._id}
                    requestId={req._id}
                    toolName={req.toolName}
                    toolCategory={req.toolCategory}
                    status={req.status}
                    startDate={req.startDate}
                    endDate={req.endDate}
                    requestedAt={req.requestedAt}
                    counterpartLabel="Borrower"
                    counterpartName={req.borrowerName}
                    counterpartEmail={req.borrowerEmail}
                    automationLogs={req.automationLogs}
                    isIncoming={true}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    onMarkReturned={handleMarkReturned}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
                <ArrowDownLeft className="mx-auto size-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No incoming requests yet</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  When neighbors request to borrow one of your tools, you will see it here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 5: ADMIN PANEL (Role-gated)                                 */}
          {/* =============================================================== */}
          {currentUser?.role === "admin" && (
            <TabsContent value="admin-panel" className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert className="size-5 text-primary" />
                  Admin Supervision Panel
                </h2>
                <p className="text-xs text-muted-foreground">
                  Enforce neighborhood guidelines, inspect all active loans, and award Trusted Lender certifications.
                </p>
              </div>

              {/* Neighbors Management Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Registered Neighbors ({allUsersAdmin?.length || 0})
                </h3>
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                  <div className="divide-y divide-border/60">
                    {allUsersAdmin?.map((u) => (
                      <div
                        key={u._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{u.name}</span>
                            {u.role === "admin" && (
                              <Badge className="bg-primary/20 text-primary border-primary/40 text-xs font-mono">
                                Admin
                              </Badge>
                            )}
                            {u.isTrustedLender && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-mono flex items-center gap-1">
                                <ShieldCheck className="size-3" />
                                Trusted
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground font-mono text-xs">
                            {u.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={u.isTrustedLender ? "outline" : "default"}
                            onClick={() => handleToggleTrusted(u._id, u.isTrustedLender)}
                            className="h-8 text-xs gap-1.5"
                          >
                            <ShieldCheck className="size-3.5" />
                            <span>
                              {u.isTrustedLender
                                ? "Revoke Trusted Badge"
                                : "Mark as Trusted Lender"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Loans Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  All Platform Loans ({allLoansAdmin?.length || 0})
                </h3>
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                  <div className="divide-y divide-border/60">
                    {allLoansAdmin && allLoansAdmin.length > 0 ? (
                      allLoansAdmin.map((loan) => (
                        <div
                          key={loan._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{loan.toolName}</span>
                              <Badge variant="outline" className="text-xs font-mono">
                                {loan.status}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-xs font-mono">
                              Borrower: {loan.borrowerName} · Lender: {loan.lenderName}
                            </div>
                          </div>

                          <div className="font-mono text-muted-foreground text-xs">
                            {loan.startDate} → {loan.endDate}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No loans recorded on the platform yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Add Tool Dialog */}
      <AddToolDialog open={isAddToolOpen} onOpenChange={setIsAddToolOpen} />

      {/* Borrow Request Dialog */}
      <BorrowRequestDialog
        open={borrowModalData.open}
        toolId={borrowModalData.toolId}
        toolName={borrowModalData.toolName}
        onOpenChange={(open) =>
          setBorrowModalData((prev) => ({ ...prev, open }))
        }
      />
    </div>
  );
}
