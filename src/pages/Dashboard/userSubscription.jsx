{
  "name": "UserSubscription",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "format": "email",
      "description": "User email"
    },
    "user_name": {
      "type": "string",
      "description": "User full name"
    },
    "company_name": {
      "type": "string",
      "description": "Company name"
    },
    "plan_id": {
      "type": "string",
      "enum": [
        "starter",
        "growth",
        "advance",
        "pro"
      ],
      "description": "Current plan"
    },
    "plan_price": {
      "type": "number",
      "description": "Monthly price in ZAR"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "pending",
        "suspended",
        "canceled",
        "past_due"
      ],
      "default": "active",
      "description": "Subscription status"
    },
    "paystack_customer_id": {
      "type": "string",
 