import { MemberModel } from "../models/memberModel.js";

const NOT_FOUND = { error: "Anggota tidak ditemukan" };

export const MemberController = {
  async getAll(req, res) {
    try {
      const members = await MemberModel.getAll({ name: req.query.name });
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const member = await MemberModel.getById(req.params.id);
      if (!member) return res.status(404).json(NOT_FOUND);
      res.json(member);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const member = await MemberModel.create(req.body ?? {});
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const member = await MemberModel.update(req.params.id, req.body ?? {});
      if (!member) return res.status(404).json(NOT_FOUND);
      res.json(member);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const member = await MemberModel.remove(req.params.id);
      if (!member) return res.status(404).json(NOT_FOUND);
      res.json({ message: "Anggota berhasil dihapus" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
