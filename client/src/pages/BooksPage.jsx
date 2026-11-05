import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X, RotateCcw, Check } from 'lucide-react';
import BookCard from '../components/BookCard';

const PRICE_TIERS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $15', min: '', max: '15' },
  { label: '$15 to $25', min: '15', max: '25' },
  { label: '$25 to $40', min: '25', max: '40' },
  { label: '$40 & Above', min: '40', max: '' },
];

const BooksPage = ({ onNotify }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read filter values from URL search params
  const currentSearch = searchParams.get('search') || '';
  const currentCategoryParam = searchParams.get('category') || '';
  const selectedCategories = currentCategoryParam
    ? currentCategoryParam.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  const currentSortBy = searchParams.get('sortBy') || 'createdAt';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentFeatured = searchParams.get('featured') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Local state for search & price inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Fetch categories once
  useEffect(() => {
    fetch('/api/books/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch(err => console.error('Categories error:', err));
  }, []);

  // Sync local inputs when params change
  useEffect(() => {
    setSearchInput(currentSearch);
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentSearch, currentMinPrice, currentMaxPrice]);

  // Fetch books when searchParams change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams);
        query.set('limit', '12');

        const res = await fetch(`/api/books?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.data || []);
          setTotalPages(data.totalPages || 1);
          setTotalBooks(data.totalBooks || 0);
        }
      } catch (err) {
        console.error('Fetch books error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleCategoryToggle = (category) => {
    let nextList = [...selectedCategories];
    if (nextList.includes(category)) {
      nextList = nextList.filter(c => c !== category);
    } else {
      nextList.push(category);
    }
    updateParam('category', nextList.join(','));
  };

  const handleAllCategoriesToggle = () => {
    updateParam('category', '');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');

    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');

    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePriceTierClick = (tier) => {
    const next = new URLSearchParams(searchParams);
    if (tier.min) next.set('minPrice', tier.min);
    else next.delete('minPrice');

    if (tier.max) next.set('maxPrice', tier.max);
    else next.delete('maxPrice');

    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    selectedCategories.length > 0 ||
    currentSearch ||
    currentMinPrice ||
    currentMaxPrice ||
    currentFeatured
  );

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
            Explore Books Catalog
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Showing <strong>{totalBooks}</strong> available titles
            {selectedCategories.length > 0 ? ` in ${selectedCategories.join(', ')}` : ''}
            {currentSearch ? ` matching "${currentSearch}"` : ''}
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn btn-secondary mobile-filter-btn"
          style={{ display: 'none' }}
        >
          <Filter size={16} /> Filters {hasActiveFilters && <span className="badge badge-primary" style={{ padding: '0.1rem 0.4rem' }}>•</span>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '2.5rem', alignItems: 'start' }} className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className={`catalog-sidebar ${mobileFilterOpen ? 'open' : ''}`} style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <Filter size={18} color="var(--color-primary)" /> Refine Books
            </div>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Search Box in Sidebar */}
          <div className="form-group">
            <label className="form-label">Search Keyword</label>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Title, author, keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Go
              </button>
            </form>
          </div>

          {/* Categories with Multi-Select Checkboxes */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Categories</label>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={handleAllCategoriesToggle}
                  style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Clear ({selectedCategories.length})
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: selectedCategories.length === 0 ? 700 : 500, backgroundColor: selectedCategories.length === 0 ? 'var(--color-primary-light)' : 'transparent', color: selectedCategories.length === 0 ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.length === 0}
                  onChange={handleAllCategoriesToggle}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>All Categories</span>
              </label>

              {categories.map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.4rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: isChecked ? 700 : 500,
                      backgroundColor: isChecked ? 'var(--color-primary-light)' : 'transparent',
                      color: isChecked ? 'var(--color-primary)' : 'var(--color-text-main)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(cat)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <label className="form-label">Price Range ($ USD)</label>

            {/* Quick Price Tier Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {PRICE_TIERS.map((tier) => {
                const isActive = currentMinPrice === tier.min && currentMaxPrice === tier.max;
                return (
                  <button
                    type="button"
                    key={tier.label}
                    onClick={() => handlePriceTierClick(tier)}
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <form onSubmit={handlePriceSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min $"
                min="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
              />
              <input
                type="number"
                placeholder="Max $"
                min="0"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.75rem' }}>
                Apply
              </button>
            </form>
          </div>

          {/* Featured Toggle */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={currentFeatured === 'true'}
                onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-primary)' }}
              />
              <span>Featured Editions Only</span>
            </label>
          </div>
        </aside>

        {/* Books Content Area */}
        <div>
          {/* Controls Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalBooks} books found)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <SlidersHorizontal size={16} color="var(--color-text-muted)" />
                <span style={{ fontWeight: 600 }}>Sort By:</span>
                <select
                  value={`${currentSortBy}_${currentSortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    const next = new URLSearchParams(searchParams);
                    next.set('sortBy', sortBy);
                    next.set('sortOrder', sortOrder);
                    next.set('page', '1');
                    setSearchParams(next);
                  }}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                >
                  <option value="createdAt_desc">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="title_asc">Title: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Removal Chips */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Filters:</span>

              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="badge badge-primary"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => handleCategoryToggle(cat)}
                  title="Remove category filter"
                >
                  {cat} <X size={12} />
                </span>
              ))}

              {currentSearch && (
                <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateParam('search', '')}>
                  "{currentSearch}" <X size={12} />
                </span>
              )}

              {(currentMinPrice || currentMaxPrice) && (
                <span
                  className="badge badge-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('minPrice');
                    next.delete('maxPrice');
                    setSearchParams(next);
                  }}
                >
                  Price: ${currentMinPrice || '0'} - ${currentMaxPrice || '∞'} <X size={12} />
                </span>
              )}

              {currentFeatured && (
                <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateParam('featured', '')}>
                  Featured <X size={12} />
                </span>
              )}

              <button
                onClick={handleClearFilters}
                style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline', marginLeft: '0.5rem' }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Books Grid / Empty State */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.75rem' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card" style={{ height: '360px', background: '#f8fafc' }} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Search size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Books Found</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 2rem' }}>
                We couldn't find any books matching your current filters. Try relaxing your search keywords, categories, or price range.
              </p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="book-grid">
              {books.map((book) => (
                <BookCard key={book._id} book={book} onNotify={onNotify} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
              <button
                onClick={() => updateParam('page', (currentPage - 1).toString())}
                disabled={currentPage <= 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => updateParam('page', pg.toString())}
                  className={`btn btn-sm ${currentPage === pg ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '2.4rem' }}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => updateParam('page', (currentPage + 1).toString())}
                disabled={currentPage >= totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
