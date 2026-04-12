import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/verify-paystack", async (req, res) => {
  const { reference } = req.body;

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      }
    }
  );

  const result = await response.json();

  if (result.data.status === "success") {
    return res.json({ status: "success", data: result.data });
  }

  res.json({ status: "failed" });
});

export default router;