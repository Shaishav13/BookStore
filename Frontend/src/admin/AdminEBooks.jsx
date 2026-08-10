import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { MdDelete, MdEdit, MdAdd, MdSearch, MdClose, MdPictureAsPdf } from "react-icons/md";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", author: "", title: "", price: "",
  category: "", image: "", pdfUrl: "", pages: "", language: "English",
};

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
      {inStock ? "Available" : "Unavailable"}
    </span>
  );
}

export default function AdminEBooks() {
  const [ebooks, setEbooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEBook, setEditEBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [authUser] = useAuth();

  const headers = { "x-admin-id": authUser?._id };

  const fetchEBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/ebooks`, { headers });
      setEbooks(res.data.ebooks);
    } catch {
      toast.error("Failed to load ebooks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEBooks(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      ebooks.filter((b) => {
        const matchSearch =
          (b.name || "").toLowerCase().includes(q) ||
          (b.author || "").toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q);
        const matchStock =
          stockFilter === "all" ||
          (stockFilter === "available" && b.inStock !== false) ||
          (stockFilter === "unavailable" && b.inStock === false);
        return matchSearch && matchStock;
      })
    );
  }, [search, ebooks, stockFilter]);

  const handleToggleStock = async (ebook) => {
    setTogglingId(ebook._id);
    try {
      const res = await axios.patch(
        `${API_URL}/admin/ebooks/${ebook._id}/stock`,
        {},
        { headers }
      );
      setEbooks((prev) => prev.map((b) => (b._id === ebook._id ? res.data.ebook : b)));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (ebook) => {
    setTogglingId(ebook._id + "-feat");
    try {
      const res = await axios.patch(
        `${API_URL}/admin/ebooks/${ebook._id}/featured`,
        {},
        { headers }
      );
      setEbooks((prev) => prev.map((b) => (b._id === ebook._id ? res.data.ebook : b)));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to update featured status");
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => { setEditEBook(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ebook) => {
    setEditEBook(ebook);
    setForm({ name: ebook.name || "", author: ebook.author || "", title: ebook.title || "", price: ebook.price || "", category: ebook.category || "", image: ebook.image || "", pdfUrl: ebook.pdfUrl || "", pages: ebook.pages || "", language: ebook.language || "English" });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditEBook(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.author || !form.price || !form.category || !form.image || !form.pdfUrl) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), pages: Number(form.pages) || 0 };
      if (editEBook) {
        const res = await axios.put(`${API_URL}/admin/ebooks/${editEBook._id}`, payload, { headers });
        setEbooks((prev) => prev.map((b) => (b._id === editEBook._id ? res.data.ebook : b)));
        toast.success("EBook updated");
      } else {
        const res = await axios.post(`${API_URL}/admin/ebooks`, payload, { headers });
        setEbooks((prev) => [res.data.ebook, ...prev]);
        toast.success("EBook created");
      }
      closeModal();
    } catch { toast.error("Failed to save ebook"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (ebookId) => {
    if (!window.confirm("Delete this ebook? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/admin/ebooks/${ebookId}`, { headers });
      toast.success("EBook deleted");
      setEbooks((prev) => prev.filter((b) => b._id !== ebookId));
    } catch { toast.error("Failed to delete ebook"); }
  };

  const availableCount = ebooks.filter((b) => b.inStock !== false).length;
  const unavailableCount = ebooks.filter((b) => b.inStock === false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-pink-500"></span>
      </div>
    );
  }

  const fields = [
    { key: "name",     label: "EBook Name *",          placeholder: "e.g. Think and Grow Rich" },
    { key: "author",   label: "Author *",               placeholder: "e.g. Napoleon Hill" },
    { key: "title",    label: "Subtitle / Description", placeholder: "Short description" },
    { key: "category", label: "Category *",             placeholder: "e.g. Self Help" },
    { key: "price",    label: "Price (₹) *",            placeholder: "e.g. 99", type: "number" },
    { key: "pages",    label: "Pages",                  placeholder: "e.g. 238", type: "number" },
    { key: "language", label: "Language",               placeholder: "e.g. English" },
    { key: "image",    label: "Cover Image URL *",      placeholder: "https://..." },
    { key: "pdfUrl",   label: "PDF URL *",              placeholder: "https://..." },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">EBooks</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-500 dark:text-slate-400 text-sm">{ebooks.length} total</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-medium">
              {availableCount} available
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-medium">
              {unavailableCount} unavailable
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Availability filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="select select-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search ebooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 w-52"
            />
          </div>
          <button onClick={openCreate} className="btn btn-sm bg-pink-600 hover:bg-pink-700 text-white border-0 gap-1">
            <MdAdd size={18} /> Add EBook
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
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>PDF</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">No ebooks found.</td></tr>
              ) : (
                filtered.map((ebook, idx) => (
                  <tr key={ebook._id} className={`transition ${ebook.inStock === false ? "opacity-60" : ""} hover:bg-slate-50 dark:hover:bg-slate-700`}>
                    <td className="text-slate-400">{idx + 1}</td>
                    <td>
                      {ebook.image ? (
                        <img src={ebook.image} alt={ebook.name} className="w-10 h-14 object-cover rounded shadow" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-14 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center text-slate-400 text-xs">N/A</div>
                      )}
                    </td>
                    <td>
                      <p className="font-medium text-slate-700 dark:text-white max-w-[130px] truncate">{ebook.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[130px]">{ebook.title}</p>
                    </td>
                    <td className="text-slate-500 dark:text-slate-300 max-w-[100px] truncate">{ebook.author}</td>
                    <td><span className="badge badge-ghost badge-sm">{ebook.category}</span></td>
                    <td className="font-semibold text-indigo-600 dark:text-indigo-400">₹{ebook.price}</td>
                    <td>
                      {ebook.pdfUrl ? (
                        <a href={ebook.pdfUrl} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-700" title="View PDF">
                          <MdPictureAsPdf size={20} />
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      <StockBadge inStock={ebook.inStock !== false} />
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(ebook)}
                        disabled={togglingId === ebook._id + "-feat"}
                        title={ebook.featured ? "Remove from Featured" : "Add to Featured"}
                        className={`btn btn-xs gap-1 border-0 font-medium ${
                          ebook.featured
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                        }`}
                      >
                        {togglingId === ebook._id + "-feat" ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : ebook.featured ? (
                          "★ Yes"
                        ) : (
                          "☆ No"
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {/* Availability toggle */}
                        <button
                          onClick={() => handleToggleStock(ebook)}
                          disabled={togglingId === ebook._id}
                          title={ebook.inStock !== false ? "Mark as Unavailable" : "Mark as Available"}
                          className={`btn btn-xs gap-1 border-0 font-medium ${
                            ebook.inStock !== false
                              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          }`}
                        >
                          {togglingId === ebook._id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : ebook.inStock !== false ? (
                            "→ Unavailable"
                          ) : (
                            "→ Available"
                          )}
                        </button>
                        <button onClick={() => openEdit(ebook)} className="btn btn-xs btn-outline btn-info gap-1">
                          <MdEdit size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(ebook._id)} className="btn btn-xs btn-outline btn-error gap-1">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <MdClose size={22} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
              {editEBook ? "Edit EBook" : "Add New EBook"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map(({ key, label, placeholder, type }) => (
                  <div key={key} className={key === "image" || key === "pdfUrl" || key === "title" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
                    <input
                      type={type || "text"}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input input-bordered input-sm w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-sm btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-sm bg-pink-600 hover:bg-pink-700 text-white border-0 flex-1">
                  {saving ? <span className="loading loading-spinner loading-xs" /> : editEBook ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
