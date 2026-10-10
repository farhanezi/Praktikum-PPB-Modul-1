import express from "express";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Library Loan API",
    description: "REST API pencatatan peminjaman buku perpustakaan",
    endpoints: {
      books: "/books",
      members: "/members",
      loans: "/loans",
      filter_example: "/loans?status=Terlambat",
    },
  });
});

app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/loans", loanRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// Menangani error dari middleware, mis. body JSON yang tidak valid
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Di Vercel, app diekspor sebagai serverless function sehingga tidak perlu listen
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
