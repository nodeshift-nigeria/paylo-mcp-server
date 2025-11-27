import dotenv from 'dotenv';

dotenv.config();

// Optional: If provided, we use it. If not, we return a placeholder or call a public endpoint (future)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export class PaymentService {
  static async generatePaymentLink(orderId: string, email: string, amountKobo: number) {
    // If no key is configured, return a simulation link or instructions
    if (!PAYSTACK_SECRET_KEY) {
      console.warn('⚠️ PAYSTACK_SECRET_KEY not configured. Returning simulation link.');
      return {
        authorization_url: `https://usepaylo.com/checkout/simulate/${orderId}?amount=${amountKobo}`,
        access_code: `sim_access_${orderId}`,
        reference: `sim_ref_${orderId}`
      };
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        reference: `mcp_${orderId}_${Date.now()}`, // Unique reference
        metadata: {
          order_id: orderId,
          source: 'paylo-mcp-agent'
        },
        callback_url: 'https://usepaylo.com/payment/callback' // Default callback
      }),
    });

    const data = await response.json();

    if (!data.status) {
      // Fallback for development/IP restriction issues
      if (data.message.includes('IP address is not allowed')) {
        console.warn('⚠️ Paystack IP restriction detected. Returning MOCK payment link for testing.');
        return {
          authorization_url: `https://checkout.paystack.com/mock-checkout-${orderId}`,
          access_code: `mock_access_${orderId}`,
          reference: `mock_ref_${orderId}`
        };
      }
      throw new Error(`Paystack initialization failed: ${data.message}`);
    }

    return {
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    };
  }

  static async verifyPayment(reference: string) {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(`Paystack verification failed: ${data.message}`);
    }

    return {
      status: data.data.status, // 'success', 'abandoned', etc.
      amount: data.data.amount,
      paid_at: data.data.paid_at
    };
  }
}
