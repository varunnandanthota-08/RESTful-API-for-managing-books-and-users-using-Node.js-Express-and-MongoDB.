import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, BookOpen, Star, TrendingUp, Compass, Award } from 'lucide-react';
import BookCard from '../components/BookCard';

const HomePage = ({ onNotify }) => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          fetch('/api/books/featured'),
          fetch('/api/books/categories')
        ]);

        if (featRes.ok) {
          const featData = await featRes.json();
          setFeaturedBooks(featData.data || []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', color: '#ffffff', padding: '5rem 0 6rem', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle decorative glow */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.75rem', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={16} color="#fbbf24" />
              <span>Discover Your Next Literary Adventure</span>
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', lineHeight: '1.15', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Stories that inspire. Knowledge that lasts forever.
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#c7d2fe', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '620px', margin: '0 auto 2.5rem' }}>
              Browse thousands of handpicked titles across fiction, science, technology, philosophy, and personal growth with next-day home delivery.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', background: '#ffffff', padding: '0.4rem 0.4rem 0.4rem 1.25rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', maxWidth: '560px', margin: '0 auto 2rem', alignItems: 'center' }}>
              <Search size={20} color="var(--color-text-muted)" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: 'var(--color-text-main)' }}
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                Explore
              </button>
            </form>

            {/* Quick Hero Category Tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#a5b4fc' }}>Trending Searches:</span>
              {['Technology', 'Fiction', 'Self-Help', 'Sci-Fi'].map((cat) => (
                <Link
                  key={cat}
                  to={`/books?category=${cat}`}
                  style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '0.2rem 0.75rem', borderRadius: '9999px', transition: 'background 0.15s ease' }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Highlights Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                <TrendingUp size={16} /> Handpicked For You
              </div>
              <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Featured Bestsellers
              </h2>
            </div>
            <Link to="/books?featured=true" className="btn btn-secondary">
              View All Featured <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.75rem' }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="card" style={{ height: '380px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div className="book-grid">
              {featuredBooks.slice(0, 8).map((book) => (
                <BookCard key={book._id} book={book} onNotify={onNotify} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Category Banner */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Genres & Collections
            </div>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
              Explore By Category
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              From fast-paced thrillers to deeply enriching non-fiction, dive straight into your favorite domain.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/books?category=${encodeURIComponent(category)}`}
                className="card"
                style={{ padding: '1.75rem 1.25rem', textAlign: 'center', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '3.25rem', height: '3.25rem', borderRadius: '9999px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-main)' }}>
                  {category}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Browse books <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Quality Banner */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                <Award size={18} /> The PageTurn Guarantee
              </div>
              <h3 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: '1.2' }}>
                Curated with love by passionate book lovers.
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                Every single book in our inventory is inspected for printing quality, pristine binding, and authenticity. We believe a good book is a companion for a lifetime.
              </p>
              <Link to="/books" className="btn btn-primary btn-lg">
                Start Reading Today <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>10k+</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Curated Titles</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Across 25+ genres</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.25rem' }}>99.8%</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Satisfied Readers</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Verified ratings</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>24h</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Dispatch Speed</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carefully packaged</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', marginBottom: '0.25rem' }}>4.9★</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Average Rating</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>From 12,000+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

