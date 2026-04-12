app.post("/api/verify-paystack", async (req, res) => {
  const { reference } = req.body;

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    }
  );

  const data = await response.json();

  if (data.data.status === "success") {
    return res.json({ status: "success" });
  }

  res.json({ status: "failed" });
});