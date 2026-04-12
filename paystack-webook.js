import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const secret = process.env.PAYSTACK_SECRET;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const data = event.data;

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${data.customer.email}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`
        }
      }
    );

    const users = await response.json();

    if (users.length) {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${users[0].id}`, {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan_status: "active",
          paystack_reference: data.reference
        })
      });
    }
  }

  return res.status(200).json({ received: true });
}