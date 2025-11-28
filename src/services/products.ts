import { supabase } from './supabase.js';

export class ProductService {
  static async searchProducts(query: string, limit: number = 20, merchantId?: string, category?: string) {
    const safeLimit = Math.min(limit, 100); // Cap limit to prevent scraping
    // Basic text search on name and description
    let dbQuery = supabase
      .from('products')
      .select(`
        id, 
        name, 
        description, 
        price, 
        image_url, 
        storefront_id,
        storefronts (
          name,
          slug,
          currency
        )
      `)
      .eq('is_available', true)
      .ilike('name', `%${query}%`)
      .limit(safeLimit);

    if (merchantId) {
      dbQuery = dbQuery.eq('storefront_id', merchantId);
    }

    // Note: Category filtering on products might need a join or a specific column depending on schema
    // For now assuming products have a category_id or similar if needed, but keeping it simple

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data;
  }

  static async getProductDetails(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        storefronts (
          name,
          slug,
          currency
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product details: ${error.message}`);
    }

    return data;
  }
}
