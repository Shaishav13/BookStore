import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { MdDelete, MdEdit, MdAdd, MdSearch, MdClose } from "react-icons/md";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const emptyForm = { name: "", title: "", price: "", category: "", image: "" };

function StockBadge({ inStock }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        inStock
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [authUser] = useAuth();

  const headers = { "x-admin-id": authUser?._id };

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/books`, { headers });
      setBooks(res.data.books);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      books.filter((b) => {
        const matchSearch =
          (b.name || "").toLowerCase().includes(q) ||
          (b.title || "").toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q);
        const matchStock =
          stockFilter === "all" ||
          (stockFilter === "instock" && b.inStock !== false) ||
          (stockFilter === "outofstock" && b.inStock === false);
        return matchSearch && matchStock;
      })
    );
  }, [search, books, stockFilter]);

  const handleToggleStock = async (book) => {
    setTogglingId(book._id);
    try {
      const res = await axios.patch(
        `${API_URL}/admin/books/${book._id}/stock`,
        {},
        { headers }
      );
      setBooks((prev) => prev.map((b) => (b._id === book._id ? res.data.book : b)));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to update stock status");
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => { setEditBook(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (book) => {
    setEditBook(book);
    setForm({ name: book.name || "", title: book.title || "", price: book.price || "", category: book.category || "", image: book.image || "" });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditBook(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.title || !form.price || !form.category) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    try {
      if (editBook) {
        const res = await axios.put(`${API_URL}/admin/books/${editBook._id}`, { ...form, price: Number(form.price) }, { headers });
        setBooks((prev) => prev.map((b) => (b._id === editBook._id ? res.data.book : b)));
        toast.success("Book updated");
      } else {
        const res = await axios.post(`${API_URL}/admin/books`, { ...form, price: Number(form.price) }, { headers });
        setBooks((prev) => [res.data.book, ...prev]);
        toast.success("Book created");
      }
      closeModal();
    } catch { toast.error("Failed to save book"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Delete this book? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/admin/books/${bookId}`, { headers });
      toast.success("Book deleted");
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    } catch { toast.error("Failed to delete book"); }
  };

  const handleToggleFeatured = async (book) => {
    setFeaturingId(book._id);
    try {
      const res = await axios.patch(
        `${API_URL}/admin/books/${book._id}/featured`,
        {},
        { headers }
      );
      setBooks(prev => prev.map(b => b._id === book._id ? res.data.book : b));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to toggle featured");
    } finally {
      setFeaturingId(null);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkUploading(true);
    const formData = new FormData();
    formData.append('csv', file);
    try {
      const res = await axios.post(`${API_URL}/admin/books/bulk-upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`✅ ${res.data.created} books uploaded!`);
      if (res.data.skipped > 0) toast.error(`⚠️ ${res.data.skipped} rows skipped`);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const inStockCount = books.filter((b) => b.inStock !== false).length;
  const outOfStockCount = books.filter((b) => b.inStock === false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-pink-500"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Books</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-500 dark:text-slate-400 text-sm">{books.length} total</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-medium">
              {inStockCount} in stock
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-medium">
              {outOfStockCount} out of stock
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Bulk Upload */}
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-sm ${
            bulkUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}>
            {bulkUploading ? '⏳ Uploading...' : '📥 Bulk Upload CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} disabled={bulkUploading} />
          </label>
          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="select select-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">All Stock</option>
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 w-52"
            />
          </div>
          <button onClick={openCreate} className="btn btn-sm bg-pink-600 hover:bg-pink-700 text-white border-0 gap-1">
            <MdAdd size={18} /> Add Book
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th>#</th>
                <th>Cover</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No books found.</td></tr>
              ) : (
                filtered.map((book, idx) => (
                  <tr key={book._id} className={`transition ${book.inStock === false ? "opacity-60" : ""} hover:bg-slate-50 dark:hover:bg-slate-700`}>
                    <td className="text-slate-400">{idx + 1}</td>
                    <td>
                      {book.image ? (
                        <img src={book.image} alt={book.name} className="w-10 h-14 object-cover rounded shadow" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-14 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center text-slate-400 text-xs">N/A</div>
                      )}
                    </td>
                    <td>
                      <p className="font-medium text-slate-700 dark:text-white max-w-[150px] truncate">{book.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{book.title}</p>
                    </td>
                    <td><span className="badge badge-ghost badge-sm">{book.category}</span></td>
                    <td className="font-semibold text-green-600 dark:text-green-400">₹{book.price}</td>
                    <td>
                      <StockBadge inStock={book.inStock !== false} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Featured toggle */}
                        <button
                          onClick={() => handleToggleFeatured(book)}
                          disabled={featuringId === book._id}
                          title={book.featured ? 'Remove from Featured' : 'Mark as Featured'}
                          className={`btn btn-xs gap-1 border-0 font-medium ${
                            book.featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {featuringId === book._id ? <span className="loading loading-spinner loading-xs" /> : book.featured ? '⭐ Featured' : '☆ Feature'}
                        </button>
                        {/* Stock toggle */}
                        <button
                          onClick={() => handleToggleStock(book)}
                          disabled={togglingId === book._id}
                          title={book.inStock !== false ? "Mark as Out of Stock" : "Mark as In Stock"}
                          className={`btn btn-xs gap-1 border-0 font-medium ${
                            book.inStock !== false
                              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          }`}
                        >
                          {togglingId === book._id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : book.inStock !== false ? (
                            "→ Out of Stock"
                          ) : (
                            "→ In Stock"
                          )}
                        </button>
                        <button onClick={() => openEdit(book)} className="btn btn-xs btn-outline btn-info gap-1">
                          <MdEdit size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(book._id)} className="btn btn-xs btn-outline btn-error gap-1">
                          <MdDelete size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <MdClose size={22} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
              {editBook ? "Edit Book" : "Add New Book"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { key: "name",     label: "Book Name *",    placeholder: "e.g. The Alchemist" },
                { key: "title",    label: "Author / Title *", placeholder: "e.g. Paulo Coelho" },
                { key: "category", label: "Category *",     placeholder: "e.g. Fiction" },
                { key: "price",    label: "Price (₹) *",    placeholder: "e.g. 299", type: "number" },
                { key: "image",    label: "Image URL",      placeholder: "https://..." },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
                  <input
                    type={type || "text"}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input input-bordered input-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-sm btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-sm bg-pink-600 hover:bg-pink-700 text-white border-0 flex-1">
                  {saving ? <span className="loading loading-spinner loading-xs" /> : editBook ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
