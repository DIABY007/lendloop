import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Computes an HMAC-SHA256 hex digest using standard Web Crypto API.
 */
async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Dispatches an event to the n8n Request Notification Webhook.
 * Payload is cryptographically signed with HMAC-SHA256 in the X-Convex-Signature header.
 * Applies Data Minimization: only transmits necessary fields.
 */
export const dispatchRequestEvent = internalAction({
  args: {
    requestId: v.id("borrowRequests"),
    eventType: v.union(
      v.literal("request_created"),
      v.literal("request_approved"),
      v.literal("request_declined"),
      v.literal("loan_returned")
    ),
    status: v.string(),
    toolName: v.string(),
    borrowerName: v.string(),
    borrowerEmail: v.string(),
    lenderName: v.string(),
    lenderEmail: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const secret = process.env.N8N_WEBHOOK_SECRET || "lendloop_shared_hmac_secret_key_2026";

    if (!webhookUrl) {
      console.warn("[n8n webhook] N8N_WEBHOOK_URL not configured. Skipping webhook call.");
      return { skipped: true, reason: "No webhook URL configured" };
    }

    const payload = {
      requestId: args.requestId,
      event: args.eventType,
      status: args.status,
      toolName: args.toolName,
      borrowerName: args.borrowerName,
      borrowerEmail: args.borrowerEmail,
      lenderName: args.lenderName,
      lenderEmail: args.lenderEmail,
      startDate: args.startDate,
      endDate: args.endDate,
      timestamp: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = await computeHmacSha256(secret, payloadString);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Convex-Signature": signature,
          "User-Agent": "LendLoop-Convex/1.0",
        },
        body: payloadString,
      });

      if (!response.ok) {
        console.error(
          `[n8n webhook] Webhook returned status ${response.status}: ${await response.text()}`
        );
        return { success: false, status: response.status };
      }

      console.log(`[n8n webhook] Successfully notified n8n of ${args.eventType} for request ${args.requestId}`);
      return { success: true };
    } catch (error) {
      console.error("[n8n webhook] Network error dispatching webhook:", error);
      return { success: false, error: String(error) };
    }
  },
});
