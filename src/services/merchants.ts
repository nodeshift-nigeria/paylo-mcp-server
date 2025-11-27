import { supabase } from './supabase.js';

export class MerchantService {
  static async listMerchants(limit: number = 10, category?: string) {
    let query = supabase
      .from('storefronts')
      .select('id, name, slug, description, logo_url, currency')
      .eq('status', 'active')
      .limit(limit);

    // if (category) {
    //   query = query.eq('category', category);
    // }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch merchants: ${error.message}`);
    }

    return data;
  }
}
