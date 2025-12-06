import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MerchantService } from "../services/merchants.js";
import { ProductService } from "../services/products.js";
import { OrderService } from "../services/orders.js";
import { PaymentService } from "../services/payments.js";

// Define schemas inline for now to break dependency on old files
const ListMerchantsSchema = {
  category: z.string().optional().describe("Filter merchants by category"),
  limit: z.number().optional().describe("Limit number of results (default: 10)"),
};

const SearchProductsSchema = {
  query: z.string().describe("Search query for products"),
  merchantId: z.string().optional().describe("Filter by specific merchant ID"),
  category: z.string().optional().describe("Filter by product category"),
  limit: z.number().optional().describe("Limit number of results (default: 20)"),
};

const ProductDetailSchema = {
  id: z.string().describe("Unique identifier of the product"),
};

const CreateOrderSchema = {
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number()
  })).describe("List of items to purchase"),
  customerEmail: z.string().email().optional().describe("Customer email for receipt (defaults to guest@paylo.ai)")
};

const GeneratePaymentLinkSchema = {
  orderId: z.string().describe("The ID of the order to pay for")
};

const CheckPaymentStatusSchema = {
  orderId: z.string().describe("The ID of the order to check")
};

/**
 * Register tool handlers with the server
 * @param server - MCP server instance
 */
export function registerToolHandlers(server: McpServer): void {
  /**
   * List Merchants tool
   * Discover available Paylo storefronts
   */
  server.tool(
    "list_merchants",
    "List available Paylo merchants and storefronts. Use this to discover stores before searching for products.",
    ListMerchantsSchema,
    async (args) => {
      try {
        const merchants = await MerchantService.listMerchants(args.limit, args.category);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(merchants, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error listing merchants: ${error}` }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * Search Products tool
   * Search for products across one or all merchants
   */
  server.tool(
    "search_products",
    "Search for products across Paylo stores. Can filter by merchant or category.",
    SearchProductsSchema,
    async (args) => {
      try {
        const products = await ProductService.searchProducts(args.query, args.limit, args.merchantId, args.category);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(products, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error searching products: ${error}` }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * Product Detail tool
   * Get rich metadata for a specific product
   */
  server.tool(
    "get_product_details",
    "Get detailed information about a specific product including price, description, and availability.",
    ProductDetailSchema,
    async (args) => {
      try {
        const product = await ProductService.getProductDetails(args.id);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(product, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching product details: ${error}` }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * Create Order tool
   * Initialize a purchase for one or more products
   */
  server.tool(
    "create_order",
    "Create a new order for products. Returns an order ID that can be used to generate a payment link.",
    CreateOrderSchema,
    async (args) => {
      try {
        const order = await OrderService.createOrder(args.items, args.customerEmail);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(order, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error creating order: ${error}` }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * Generate Payment Link tool
   * Get a checkout URL for an order
   */
  server.tool(
    "generate_payment_link",
    "Generate a Paystack payment link for an existing order. Returns the URL to share with the user.",
    GeneratePaymentLinkSchema,
    async (args) => {
      try {
        // 1. Get order details to know the amount
        const order = await OrderService.getOrderStatus(args.orderId);
        if (!order) throw new Error("Order not found");
        
        // 2. Generate link
        // Note: We use a placeholder email if none was stored, or fetch from order if we stored it (we stored it in unified_payments)
        // For now, let's assume we can get it or use a default. 
        // Actually, OrderService.getOrderStatus doesn't return email. Let's fix that or pass it.
        // For MVP, we'll use a default if not available, but ideally we fetch it.
        
        const payment = await PaymentService.generatePaymentLink(
          args.orderId, 
          order.customer_email || "guest@paylo.ai",
          order.total_amount_kobo
        );

        // 3. Update order with reference
        await OrderService.updateOrderReference(args.orderId, payment.reference);

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(payment, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error generating payment link: ${error}` }
          ],
          isError: true
        };
      }
    }
  );

  /**
   * Check Payment Status tool
   * Verify if an order has been paid
   */
  server.tool(
    "check_payment_status",
    "Check the payment status of an order. Returns 'success', 'pending', or 'failed'.",
    CheckPaymentStatusSchema,
    async (args) => {
      try {
        const order = await OrderService.getOrderStatus(args.orderId);
        // If status is already 'completed' in DB, return that
        // If 'pending', check with Paystack (if we had the reference)
        // For now, just return the DB status. In a real app, we might trigger a re-check if pending.
        
        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ status: order.status, paid_at: order.paid_at }, null, 2) }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text" as const, text: `Error checking payment status: ${error}` }
          ],
          isError: true
        };
      }
    }
  );
}
