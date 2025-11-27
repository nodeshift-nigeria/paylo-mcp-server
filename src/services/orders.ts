import { supabase } from './supabase.js';
import { ProductService } from './products.js';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export class OrderService {
  static async createOrder(items: OrderItem[], customerEmail: string = 'guest@paylo.ai') {
    // 1. Fetch product details and calculate totals
    let totalAmountKobo = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await ProductService.getProductDetails(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Assuming price is in major units (e.g., NGN), convert to kobo
      // If currency is not NGN, we might need conversion, but for now assume NGN/Kobo
      const priceKobo = Math.round(product.price * 100); 
      const lineTotal = priceKobo * item.quantity;
      
      totalAmountKobo += lineTotal;

      enrichedItems.push({
        ...item,
        product,
        priceKobo,
        lineTotal
      });
    }

    // 2. Create Unified Payment Record
    const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const { data: payment, error: paymentError } = await supabase
      .from('unified_payments')
      .insert({
        customer_email: customerEmail,
        total_amount_kobo: totalAmountKobo,
        status: 'pending',
        payment_type: 'single_store', // Changed from 'checkout' to match constraint
        currency: 'NGN', // Defaulting to NGN for MVP
        reference: reference,
        metadata: {
          source: 'paylo-mcp-agent'
        }
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create order: ${paymentError.message}`);
    }

    // 3. Create Payment Items
    const paymentItems = enrichedItems.map(item => ({
      payment_id: payment.id,
      storefront_id: item.product.storefront_id,
      item_id: item.productId,
      item_name: item.product.name,
      item_type: 'product',
      quantity: item.quantity,
      unit_price_kobo: item.priceKobo,
      line_total_kobo: item.lineTotal
    }));

    const { error: itemsError } = await supabase
      .from('payment_items')
      .insert(paymentItems);

    if (itemsError) {
      // Rollback payment creation if items fail (manual rollback since no transactions in HTTP API)
      await supabase.from('unified_payments').delete().eq('id', payment.id);
      throw new Error(`Failed to add items to order: ${itemsError.message}`);
    }

    return {
      orderId: payment.id,
      totalAmount: totalAmountKobo / 100,
      currency: 'NGN',
      itemCount: items.length
    };
  }

  static async getOrderStatus(orderId: string) {
    const { data, error } = await supabase
      .from('unified_payments')
      .select('status, total_amount_kobo, currency, paid_at, customer_email')
      .eq('id', orderId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch order status: ${error.message}`);
    }

    return data;
  }

  static async updateOrderReference(orderId: string, reference: string) {
    const { error } = await supabase
      .from('unified_payments')
      .update({ reference })
      .eq('id', orderId);

    if (error) {
      throw new Error(`Failed to update order reference: ${error.message}`);
    }
  }
}
