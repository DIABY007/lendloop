import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Computes an HMAC-SHA256 hex digest for signature comparison.
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
 * Endpoint called by n8n scheduled workflow to fetch overdue loans.
 * Secured via Bearer token: Authorization: Bearer <CONVEX_N8N_API_SECRET>
 */
http.route({
  path: "/api/overdue-loans",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const expectedSecret =
      process.env.CONVEX_N8N_API_SECRET || "lendloop_convex_api_bearer_token_2026";

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const overdueLoans = await ctx.runQuery(internal.borrowRequests.getOverdueLoans, {});

    return new Response(JSON.stringify({ overdueLoans }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * Endpoint called by n8n to write back reminder status into Convex.
 * Secured via HMAC signature: X-N8N-Signature
 * Idempotent write-back via idempotencyKey.
 */
http.route({
  path: "/api/automation-log",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("X-N8N-Signature");
    const secret = process.env.N8N_WEBHOOK_SECRET || "lendloop_shared_hmac_secret_key_2026";

    const bodyText = await request.text();

    // Verify HMAC signature using timing-safe comparison
    if (signature) {
      const expectedSignature = await computeHmacSha256(secret, bodyText);
      if (!timingSafeEqual(signature, expectedSignature)) {
        return new Response(JSON.stringify({ error: "Invalid HMAC signature" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Fallback check: Authorization header
      const authHeader = request.headers.get("Authorization");
      const expectedBearer =
        process.env.CONVEX_N8N_API_SECRET || "lendloop_convex_api_bearer_token_2026";
      if (!authHeader || authHeader !== `Bearer ${expectedBearer}`) {
        return new Response(JSON.stringify({ error: "Missing authentication" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    try {
      const data = JSON.parse(bodyText);
      const { borrowRequestId, type, message, idempotencyKey } = data;

      if (!borrowRequestId || !type || !message || !idempotencyKey) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await ctx.runMutation(internal.automationLogs.recordLog, {
        borrowRequestId,
        type,
        message,
        idempotencyKey,
      });

      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON or internal error" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * Clerk Webhook Handler: synchronizes users from Clerk to Convex.
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    const payloadString = await request.text();
    const svixHeaders = {
      "svix-id": request.headers.get("svix-id") || "",
      "svix-timestamp": request.headers.get("svix-timestamp") || "",
      "svix-signature": request.headers.get("svix-signature") || "",
    };

    let event: any;

    if (webhookSecret) {
      try {
        const wh = new Webhook(webhookSecret);
        event = wh.verify(payloadString, svixHeaders) as any;
      } catch (err) {
        console.error("Clerk webhook verification failed:", err);
        return new Response("Webhook verification failed", { status: 400 });
      }
    } else {
      // For local development without webhook secret configured
      try {
        event = JSON.parse(payloadString);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    const { type, data } = event;

    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses?.find(
        (e: any) => e.id === data.primary_email_address_id
      )?.email_address || data.email_addresses?.[0]?.email_address || "";

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "Neighbor";

      await ctx.runMutation(internal.users.syncUserFromClerk, {
        clerkId: data.id,
        name,
        email: primaryEmail,
        imageUrl: data.image_url,
      });
    } else if (type === "user.deleted") {
      if (data.id) {
        await ctx.runMutation(internal.users.deleteUserFromClerk, {
          clerkId: data.id,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
