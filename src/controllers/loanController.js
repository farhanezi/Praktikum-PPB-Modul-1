import { LoanModel, LOAN_STATUSES } from "../models/loanModel.js";
import { today, addDays } from "../utils/date.js";

const LOAN_PERIOD_DAYS = 7;
const NOT_FOUND = { error: "Data peminjaman tidak ditemukan" };

// "terlambat" / "TERLAMBAT" -> "Terlambat"
const normalizeStatus = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

export const LoanController = {
  async getAll(req, res) {
    try {
      const { member_id, book_id } = req.query;
      const status = req.query.status && normalizeStatus(req.query.status);

      if (status && !LOAN_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Status tidak valid. Gunakan salah satu: ${LOAN_STATUSES.join(", ")}`,
        });
      }

      const loans = await LoanModel.getAll({ status, member_id, book_id });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const loan = await LoanModel.getById(req.params.id);
      if (!loan) return res.status(404).json(NOT_FOUND);
      res.json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { member_id, book_id, loan_date, due_date, status, notes } =
        req.body ?? {};

      if (!member_id || !book_id) {
        return res
          .status(400)
          .json({ error: "member_id dan book_id wajib diisi" });
      }

      const loanDate = loan_date || today();
      const loan = await LoanModel.create({
        member_id,
        book_id,
        loan_date: loanDate,
        due_date: due_date || addDays(loanDate, LOAN_PERIOD_DAYS),
        status: status || "Dipinjam",
        notes,
      });
      res.status(201).json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id, ...payload } = req.body ?? {};

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Body request tidak boleh kosong" });
      }
      if (payload.return_date && !payload.status) {
        payload.status = "Dikembalikan";
      }

      const loan = await LoanModel.update(req.params.id, payload);
      if (!loan) return res.status(404).json(NOT_FOUND);
      res.json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const loan = await LoanModel.remove(req.params.id);
      if (!loan) return res.status(404).json(NOT_FOUND);
      res.json({ message: "Data peminjaman berhasil dihapus" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
