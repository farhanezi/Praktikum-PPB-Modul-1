import { supabase } from "../config/supabaseClient.js";

export const BookModel = {
  async getAll(filters = {}) {
    let query = supabase.from("books").select("*").order("title");

    if (filters.title) {
      query = query.ilike("title", `%${filters.title}%`);
    }
    if (filters.author) {
      query = query.ilike("author", `%${filters.author}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(book) {
    const { data, error } = await supabase
      .from("books")
      .insert([book])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, book) {
    const { data, error } = await supabase
      .from("books")
      .update(book)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
