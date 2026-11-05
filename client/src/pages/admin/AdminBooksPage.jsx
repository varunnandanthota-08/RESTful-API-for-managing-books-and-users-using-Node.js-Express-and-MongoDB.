import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowLeft, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BOOK_FALLBACK_IMAGE, handleImageError, generateTitleCoverSvg } from '../../utils/imageHelper';

const AdminBooksPage = ({ onNotify }) => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    year: new Date().getFullYear(),
    category: 'Fiction',
    stock: 10,
    isbn: '',
    description: '',
    coverImage: '',
    isFeatured: false
  });
  const [saving, setSaving] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/books?limit=100');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      price: '',
      year: new Date().getFullYear(),
      category: 'Fiction',
      stock: 10,
      isbn: '',
      description: '',
      coverImage: '',
      isFeatured: false
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      year: book.year,
      category: book.category,
      stock: book.stock,
      isbn: book.isbn || '',
      description: book.description || '',
      coverImage: book.coverImage || '',
      isFeatured: Boolean(book.isFeatured)
    });
    setModalOpen(true);
  };

  const handleDelete = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (onNotify) onNotify(`"${title}" deleted successfully`, 'success');
        fetchBooks();
      } else {
        const err = await res.json();
        if (onNotify) onNotify(err.message || 'Delete failed', 'error');
      }
    } catch (e) {
      if (onNotify) onNotify('Error deleting book', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingBook ? `/api/books/${editingBook._id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        if (onNotify) onNotify(editingBook ? 'Book details updated' : 'New book added to catalog', 'success');
        setModalOpen(false);
        fetchBooks();
      } else {
        if (onNotify) onNotify(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      if (onNotify) onNotify('Error saving book', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Book Inventory Management
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Add, update, or remove books and maintain accurate stock levels
            </p>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} /> Add New Book
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Filter inventory by title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
        />
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Book Title & Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>Loading catalog...</td>
              </tr>
            ) : filteredBooks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No books found in inventory matching your search.
                </td>
              </tr>
            ) : (
              filteredBooks.map((book) => (
                <tr key={book._id}>
                  <td style={{ width: '60px' }}>
                    <div style={{ width: '40px', height: '56px', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px' }}>
                      <img
                        src={book.coverImage || generateTitleCoverSvg(book.title, book.author, book.category)}
                        alt={book.title}
                        data-title={book.title}
                        data-author={book.author}
                        data-category={book.category}
                        onError={handleImageError}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{book.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>by {book.author} ({book.year})</div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{book.category}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>${Number(book.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${book.stock === 0 ? 'badge-danger' : book.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                      {book.stock === 0 ? 'Out of Stock' : `${book.stock} units`}
                    </span>
                  </td>
                  <td>
                    {book.isFeatured ? (
                      <span className="badge badge-primary">Yes</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>No</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="btn btn-secondary btn-sm"
                        title="Edit book"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(book._id, book.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                        title="Delete book"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Book Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                {editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--color-text-light)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category / Genre *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    placeholder="Fiction, Sci-Fi, Technology..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Publication Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ISBN Number</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="form-input"
                    placeholder="978-0123456789"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Book Synopsis & Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-primary)' }}
                    />
                    <span>Mark as Featured Edition on Homepage</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooksPage;

