import { useState, useEffect } from 'react';

const MAX_ITEMS = 10;
const KEY = 'ub_books_recently_viewed';

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addItem = (book) => {
    setItems(prev => {
      const filtered = prev.filter(b => b._id !== book._id);
      const updated = [book, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearItems = () => {
    localStorage.removeItem(KEY);
    setItems([]);
  };

  return { items, addItem, clearItems };
}
