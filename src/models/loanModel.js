import { supabase } from "../config/supabaseClient.js";
import { today } from "../utils/date.js";

export const LOAN_STATUSES = ["Dipinjam", "Dikembalikan", "Terlambat"];

const LOAN_SELECT = `
  id, member_id, book_id, loan_date, due_date, return_date, status, notes, created_at,
  member:members ( id, member_code, name ),
  book:books ( id, title, author )
`;

export const LoanModel = {
  // Peminjaman yang melewati due_date dan belum dikembalikan ditandai "Terlambat"
  async markOverdue() {
    const { error } = await supabase
      .from("loans")
      .update({ status: "Terlambat" })
      .eq("status", "Dipinjam")
      .lt("due_date", today());
    if (error) throw error;
  },

  async getAll(filters = {}) {
    await this.markOverdue();

    let query = supabase
      .from("loans")
      .select(LOAN_SELECT)
      .order("loan_date", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.member_id) {
      query = query.eq("member_id", filters.member_id);
    }
    if (filters.book_id) {
      query = query.eq("book_id", filters.book_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    await this.markOverdue();

    const { data, error } = await supabase
      .from("loans")
      .select(LOAN_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("loans")
      .insert([payload])
      .select(LOAN_SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("loans")
      .update(payload)
      .eq("id", id)
      .select(LOAN_SELECT)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("loans")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
