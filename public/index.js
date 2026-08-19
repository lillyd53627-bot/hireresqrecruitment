import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import enrichmentRouter from "./enrichment.js";

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "HireResQ backend is running",
  });
});

// ============================================================
// ENRICHMENT
// ============================================================

app.use("/api/enrichment", enrichmentRouter);

// ============================================================
// PLAN CONFIGURATION
// ============================================================

const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    amount: 154900,
    activeJobs: 1,
    candidateMatches: 20,
  },

  growth: {
    id: "growth",
    name: "Growth",
    amount: 354900,
    activeJobs: 3,
    candidateMatches: 60,
  },

  advance: {
    id: "advance",
    name: "Advance",
    amount: 634900,
    activeJobs: 5,
    candidateMatches: 100,
  },
};

// ============================================================
// PAYSTACK VERIFICATION + SUBSCRIPTION ACTIVATION
// ============================================================

app.post("/api/verify-paystack", async (req, res) => {
  try {
    const { reference, user_id, plan_id } = req.body;

    if (!reference) {
      return res.status(400).json({
        status: "failed",
        message: "Payment reference is required",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        status: "failed",
        message: "User ID is required",
      });
    }

    if (!process.env.PAYSTACK_SECRET) {
      console.error("❌ PAYSTACK_SECRET is missing");

      return res.status(500).json({
        status: "failed",
        message: "Paystack secret key is not configured",
      });
    }

    if (!process.env.SUPABASE_URL) {
      console.error("❌ SUPABASE_URL is missing");

      return res.status(500).json({
        status: "failed",
        message: "Supabase URL is not configured",
      });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");

      return res.status(500).json({
        status: "failed",
        message: "Supabase server key is not configured",
      });
    }

    console.log("==========================================");
    console.log("VERIFYING LIVE PAYSTACK PAYMENT");
    console.log("Reference:", reference);
    console.log("User:", user_id);
    console.log("Plan:", plan_id);
    console.log("==========================================");

    // ----------------------------------------------------------
    // 1. Verify transaction directly with Paystack
    // ----------------------------------------------------------

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack verification failed:", paystackResult);

      return res.status(400).json({
        status: "failed",
        message:
          paystackResult?.message ||
          "Unable to verify payment with Paystack",
      });
    }

    const transaction = paystackResult?.data;

    if (!transaction) {
      return res.status(400).json({
        status: "failed",
        message: "Paystack returned no transaction data",
      });
    }

    console.log("Paystack transaction:", {
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      reference: transaction.reference,
      email: transaction.customer?.email,
    });

    // ----------------------------------------------------------
    // 2. Payment must be successful
    // ----------------------------------------------------------

    if (transaction.status !== "success") {
      return res.status(400).json({
        status: "failed",
        message: `Payment status is ${transaction.status}`,
      });
    }

    // ----------------------------------------------------------
    // 3. Currency must be ZAR
    // ----------------------------------------------------------

    if (transaction.currency !== "ZAR") {
      return res.status(400).json({
        status: "failed",
        message: "Payment currency is not ZAR",
      });
    }

    // ----------------------------------------------------------
    // 4. Determine plan from the server-side plan table
    // ----------------------------------------------------------

    const plan = PLANS[plan_id];

    if (!plan) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid subscription plan",
      });
    }

    // ----------------------------------------------------------
    // 5. Verify the ACTUAL Paystack amount
    // ----------------------------------------------------------

    if (Number(transaction.amount) !== Number(plan.amount)) {
      console.error("Amount mismatch:", {
        expected: plan.amount,
        received: transaction.amount,
      });

      return res.status(400).json({
        status: "failed",
        message: "Payment amount does not match selected plan",
      });
    }

    // ----------------------------------------------------------
    // 6. Prevent duplicate fulfillment
    // ----------------------------------------------------------

    const existingResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/subscriptions?paystack_reference=eq.${encodeURIComponent(
        reference
      )}&select=id`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const existingSubscriptions = await existingResponse.json();

    if (
      Array.isArray(existingSubscriptions) &&
      existingSubscriptions.length > 0
    ) {
      console.log("⚠️ Subscription already activated:", reference);

      return res.json({
        status: "success",
        alreadyActivated: true,
        message: "This payment has already been processed",
      });
    }

    // ----------------------------------------------------------
    // 7. Create 30-day subscription
    // ----------------------------------------------------------

    const startsAt = new Date();

    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const subscription = {
      user_id: user_id,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.amount / 100,
      active_jobs_limit: plan.activeJobs,
      candidate_matches_limit: plan.candidateMatches,
      status: "active",
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      paystack_reference: reference,
    };

    console.log("Creating subscription:", subscription);

    // ----------------------------------------------------------
    // 8. Insert subscription into Supabase
    // ----------------------------------------------------------

    const subscriptionResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/subscriptions`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(subscription),
      }
    );

    const subscriptionResult = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error(
        "❌ Failed to create subscription:",
        subscriptionResult
      );

      return res.status(500).json({
        status: "failed",
        message: "Payment verified but subscription could not be created",
        details: subscriptionResult,
      });
    }

    console.log("✅ SUBSCRIPTION ACTIVATED");

    return res.json({
      status: "success",
      message: "Payment verified and subscription activated",
      subscription: Array.isArray(subscriptionResult)
        ? subscriptionResult[0]
        : subscriptionResult,
      payment: {
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        paid_at: transaction.paid_at,
      },
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);

    return res.status(500).json({
      status: "failed",
      message: "An error occurred while processing the payment",
    });
  }
});

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "API route not found",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 HireResQ backend running on port ${PORT}`);
});