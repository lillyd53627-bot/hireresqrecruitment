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
    status: "online",
    service: "HireResQ API",
  });
});

// ============================================================
// ENRICHMENT ROUTES
// ============================================================

app.use("/api/enrichment", enrichmentRouter);

// ============================================================
// PAYSTACK PAYMENT VERIFICATION
// ============================================================

app.post("/api/verify-paystack", async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        status: "failed",
        message: "Payment reference is required",
      });
    }

    if (!process.env.PAYSTACK_SECRET) {
      console.error("PAYSTACK_SECRET is missing");

      return res.status(500).json({
        status: "failed",
        message: "Paystack configuration is missing",
      });
    }

    console.log("Verifying Paystack payment:", reference);

    const response = await fetch(
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

    const result = await response.json();

    console.log("Paystack verification response:", result);

    if (!response.ok) {
      return res.status(response.status).json({
        status: "failed",
        message:
          result?.message || "Paystack payment verification failed",
      });
    }

    if (result?.data?.status === "success") {
      return res.json({
        status: "success",
        data: result.data,
      });
    }

    return res.json({
      status: "failed",
      message: "Payment was not successful",
      data: result.data || null,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);

    return res.status(500).json({
      status: "failed",
      message: "Unable to verify payment",
    });
  }
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "API route not found",
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`HireResQ API running on port ${PORT}`);
});