import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import toast from 'react-hot-toast';
import { MdSearch, MdClose, MdStar, MdStarBorder, MdCheck, MdDelete } from 'react-icons/md';

const statusStyle = {
  true:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  false: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
};

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        s <= rating
          ? <MdStar key={s} className="text-yellow-400" size={16} />
          : <MdStarBorder key={s} className="text-gray-300" size={16} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [loading, setLoading] = useState(true);
  const [authUser] = useAuth();
  const headers = { 'x-admin-id': authUser?._id };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:4001/admin/reviews', { headers });
      setReviews(res.data.reviews);
      setFiltered(res.data.reviews);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(reviews.filter(r => {
      const matchSearch =
        (r.userId?.name || '').toLowerCase().includes(q) ||
        (r.bookId?.name || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      const matchFilter =
        filter === 'all' ||
        (filter === 'approved' && r.approved) ||
        (filter === 'pending' && !r.approved);
      return matchSearch && matchFilter;
    }));
  }, [search, filter, reviews]);

  const handleApprove = async (reviewId) => {
    try {
      await axios.patch(`http://localhost:4001/admin/reviews/${reviewId}/approve`, {}, { headers });
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, approved: true } : r));
      toast.success('Review approved');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`http://localhost:4001/admin/reviews/${reviewId}`, { headers });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="loading loading-spinner loading-lg text-pink-500"></span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reviews</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {pendingCount} pending · {approvedCount} approved
          </p>
        </div>
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by user, book, comment…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 w-64"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `All (${reviews.length})` },
          { key: 'pending', label: `⏳ Pending (${pendingCount})` },
          { key: 'approved', label: `✅ Approved (${approvedCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === tab.key
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th>Book</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No reviews found.</td></tr>
              ) : filtered.map(review => (
                <tr key={review._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td>
                    <div className="flex items-center gap-2 max-w-[140px]">
                      {review.bookId?.image && (
                        <img src={review.bookId.image} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                      )}
                      <span className="text-slate-700 dark:text-white text-xs font-medium truncate">
                        {review.bookId?.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-slate-700 dark:text-white text-xs">{review.userId?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{review.userId?.email || ''}</p>
                  </td>
                  <td><StarDisplay rating={review.rating} /></td>
                  <td>
                    <p className="text-slate-600 dark:text-slate-300 text-xs max-w-[200px] line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="text-slate-400 text-xs">
                    {new Date(review.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${review.approved ? statusStyle.true : statusStyle.false}`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="btn btn-xs btn-success gap-1 text-white"
                          title="Approve"
                        >
                          <MdCheck size={14} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="btn btn-xs btn-error gap-1 text-white"
                        title="Delete"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
