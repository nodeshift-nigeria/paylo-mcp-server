
export class PaymentService {
  static async generatePaymentLink(orderId: string, email: string, amountKobo: number) {
    console.log('🌐 Delegating payment generation to Paylo Backend API...');
    
    try {
      const backendResponse = await fetch('https://usepaylo.com/api/mcp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email,
          amountKobo,
          metadata: { source: 'paylo-mcp-public' }
        })
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Backend API error: ${backendResponse.status} ${errorText}`);
      }

      const backendData = await backendResponse.json();
      return backendData; // Expecting { authorization_url, access_code, reference }
    } catch (error: any) {
      console.error('❌ Backend API call failed:', error.message);
      throw new Error(`Failed to initialize payment via Paylo Backend: ${error.message}`);
    }
  }

}
