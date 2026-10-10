import { BookModel } from "../models/bookModel.js";

const NOT_FOUND = { error: "Buku tidak ditemukan" };

export const BookController = {
  async getAll(req, res) {
    try {
      const books = await BookModel.getAll({
        title: req.query.title,
        author: req.query.author,
      });
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const book = await BookModel.getById(req.params.id);
      if (!book) return res.status(404).json(NOT_FOUND);
      res.json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const book = await BookModel.create(req.body ?? {});
      res.status(201).json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const book = await BookModel.update(req.params.id, req.body ?? {});
      if (!book) return res.status(404).json(NOT_FOUND);
      res.json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const book = await BookModel.remove(req.params.id);
      if (!book) return res.status(404).json(NOT_FOUND);
      res.json({ message: "Buku berhasil dihapus" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
