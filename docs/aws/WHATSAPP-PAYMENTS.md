# WhatsApp Payments API Documentation

**Last Updated**: 2026-01-24  
**Region**: India Only (UPI Payments)  
**Payment Gateway**: Razorpay (MID: acc_HDfub6wOfQybuH)  
**Payment Configuration**: WECARE-DIGITAL

---

## Overview

WhatsApp Payments allows businesses to receive payments directly inside WhatsApp using UPI. There are TWO ways to send payment requests:

1. **Interactive `order_details` Message** - Within 24-hour customer service window
2. **Order Details Template Message** - Outside 24-hour window (requires approved template)

---

## 1. Interactive Order Details Message (Within 24h Window)

Use this format when the customer has messaged you within the last 24 hours.

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+919876543210",
  "type": "interactive",
  "interactive": {
    "type": "order_details",
    "header": {
      "type": "image",
      "image": {
        "link": "https://example.com/invoice.png"
      }
    },
    "body": {
      "text": "Your order is ready for payment"
    },
    "footer": {
      "text": "WECARE.DIGITAL"
    },
    "action": {
      "name": "review_and_pay",
      "parameters": {
        "reference_id": "ORDER_12345",
        "type": "digital-goods",
        "payment_settings": [
          {
            "type": "payment_gateway",
            "payment_gateway": {
              "type": "razorpay",
              "configuration_name": "WECARE-DIGITAL",
              "razorpay": {
                "receipt": "receipt-12345",
                "notes": {
                  "order_id": "ORDER_12345"
                }
              }
            }
          }
        ],
        "currency": "INR",
        "total_amount": {
          "value": 10000,
          "offset": 100
        },
        "order": {
          "status": "pending",
          "items": [
            {
              "retailer_id": "WECARE_DIGITAL",
              "name": "Consultation Fee",
              "amount": {
                "value": 10000,
                "offset": 100
              },
              "quantity": 1
            }
          ],
          "subtotal": {
            "value": 10000,
            "offset": 100
          },
          "tax": {
            "value": 0,
            "offset": 100
          },
          "shipping": {
            "value": 0,
            "offset": 100
          },
          "discount": {
            "value": 0,
            "offset": 100
          }
        }
      }
    }
  }
}
```

### Key Fields for Interactive Message:
- `type`: Must be `"interactive"`
- `interactive.type`: Must be `"order_details"`
- `action.name`: Must be `"review_and_pay"`
- `payment_settings`: Array containing payment gateway configuration
- `payment_gateway.type`: `"razorpay"` (or `"payu"`, `"billdesk"`, `"zaakpay"`)
- `payment_gateway.configuration_name`: Your payment config name in Meta Business Manager

---

## 2. Order Details Template Message (Outside 24h Window)

Use this format when sending payment requests outside the 24-hour window. Requires an approved template with ORDER_DETAILS button.

### Template Requirements:
- **Category**: UTILITY (Payment Utility sub-category)
- **Button Type**: ORDER_DETAILS
- **Button Text**: e.g., "Review and Pay"

### Template Message Payload:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+919876543210",
  "type": "template",
  "template": {
    "name": "02_wd_order_payment",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://example.com/invoice.png"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "Invoice #12345"
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "order_details",
        "index": 0,
        "parameters": [
          {
            "type": "action",
            "action": {
              "order_details": {
                "reference_id": "ORDER_12345",
                "type": "digital-goods",
                "payment_configuration": "WECARE-DIGITAL",
                "payment_type": "upi",
                "currency": "INR",
                "total_amount": {
                  "value": 10000,
                  "offset": 100
                },
                "order": {
                  "status": "pending",
                  "items": [
                    {
                      "retailer_id": "WECARE_DIGITAL",
                      "product_id": "CONSULT_001",
                      "name": "Consultation Fee",
                      "amount": {
                        "value": 10000,
                        "offset": 100
                      },
                      "quantity": 1
                    }
                  ],
                  "subtotal": {
                    "value": 10000,
                    "offset": 100
                  },
                  "tax": {
                    "value": 0,
                    "offset": 100
                  },
                  "shipping": {
                    "value": 0,
                    "offset": 100
                  },
                  "discount": {
                    "value": 0,
                    "offset": 100
                  }
                }
              }
            }
          }
        ]
      }
    ]
  }
}
```

### Key Differences from Interactive Message:
- `type`: `"template"` instead of `"interactive"`
- Uses `payment_configuration` (string) instead of `payment_settings` (array)
- Uses `payment_type: "upi"` instead of `payment_gateway.type`
- Button component with `sub_type: "order_details"`

---

## Payment Configuration Setup

### In Meta Business Manager:
1. Go to WhatsApp Manager → Direct Pay Methods → India
2. Add Payment Gateway (Razorpay)
3. Enter Razorpay MID: `acc_HDfub6wOfQybuH`
4. Configuration Name: `WECARE-DIGITAL`
5. Complete verification

### Supported Payment Gateways (India):
- Razorpay
- PayU
- BillDesk
- Zaakpay

---

## Amount Format

All amounts use `offset` for decimal precision:
- `offset: 100` means divide value by 100
- `value: 10000` with `offset: 100` = ₹100.00
- `value: 15050` with `offset: 100` = ₹150.50

---

## Payment Status Webhooks

When payment status changes, you receive a webhook:

```json
{
  "statuses": [{
    "id": "wamid.xxx",
    "recipient_id": "919876543210",
    "type": "payment",
    "status": "captured",
    "payment": {
      "reference_id": "ORDER_12345",
      "amount": {
        "value": 10000,
        "offset": 100
      },
      "currency": "INR"
    },
    "timestamp": "1706140800"
  }]
}
```

### Payment Status Values:
- `pending` - Payment initiated
- `captured` - Payment successful
- `failed` - Payment failed

---

## Order Status Updates

Send order status updates using `order_status` interactive message:

```json
{
  "type": "interactive",
  "interactive": {
    "type": "order_status",
    "body": {
      "text": "Your payment was successful!"
    },
    "action": {
      "name": "review_order",
      "parameters": {
        "reference_id": "ORDER_12345",
        "order": {
          "status": "completed",
          "description": "Payment received. Thank you!"
        }
      }
    }
  }
}
```

### Order Status Values:
- `pending` - Order created, awaiting payment
- `processing` - Payment received, processing order
- `shipped` - Order shipped
- `completed` - Order delivered
- `canceled` - Order canceled

---

## WECARE.DIGITAL Configuration

| Setting | Value |
|---------|-------|
| Payment Config Name | WECARE-DIGITAL |
| Payment Gateway | Razorpay |
| Razorpay MID | acc_HDfub6wOfQybuH |
| MCC | 4722 (Travel agencies) |
| Purpose Code | 03 (Travel) |
| WABA ID | 1347766229904230 |
| Phone Number | +91 93309 94400 |

---

## Current Template: 02_wd_order_payment

| Property | Value |
|----------|-------|
| Name | 02_wd_order_payment |
| Category | MARKETING (should be UTILITY) |
| Sub-category | ORDER_DETAILS |
| Status | APPROVED |
| Language | en |
| Meta Template ID | 1346233717276909 |

### Template Components:
1. **HEADER**: Image format
2. **BODY**: "👀 Quick reminder\nYour payment for {{1}} is still pending.\nTap below to pay now 💳 🤝\n\nNeed help? Reply SUPPORT anytime."
3. **FOOTER**: "WECARE.DIGITAL"
4. **BUTTON**: ORDER_DETAILS type, text "Review and Pay"

---

## Known Issues

1. **Template Category**: Current template is MARKETING, should be UTILITY for payment templates
2. **Message Delivery**: API returns success but messages may not be delivered if:
   - Payment configuration not properly linked
   - Template category incorrect
   - Recipient not in India (UPI only works for Indian numbers)

---

## References

- [360dialog Payments Documentation](https://docs.360dialog.com/docs/waba-messaging/payments-india-only)
- [Meta WhatsApp Payments API](https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-in)
- [AWS EUM Social Messaging](https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-send-message.html)
