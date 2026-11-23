import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, BookOpen, ExternalLink } from 'lucide-react';
import '../App.css';

const blogPosts = [
  {
    title: 'The Science Behind Word Scrambles: Why Your Brain Loves Anagrams',
    excerpt: 'Discover why solving anagrams is such a satisfying cognitive exercise and how it strengthens neural pathways.',
    category: 'Science',
    date: 'June 15, 2026',
    readTime: 6,
    slug: 'science-behind-word-scrambles',
  },
  {
    title: '10 Tips to Become a Word Scramble Master',
    excerpt: 'Expert strategies to unscramble words faster and boost your score in Word Scrambl.',
    category: 'Strategy',
    date: 'June 8, 2026',
    readTime: 5,
    slug: 'tips-word-scramble-master',
  },
  {
    title: 'How Word Games Can Improve Your Vocabulary',
    excerpt: 'Word puzzles do more than entertain — they actively build your vocabulary. Here\'s how.',
    category: 'Education',
    date: 'May 30, 2026',
    readTime: 4,
    slug: 'word-games-improve-vocabulary',
  },
  {
    title: 'The History of Jumble Puzzles',
    excerpt: 'From newspaper columns to digital apps — the fascinating 70-year journey of the Jumble puzzle format.',
    category: 'History',
    date: 'May 22, 2026',
    readTime: 7,
    slug: 'history-jumble-puzzles',
  },
  {
    title: 'Word Games vs. Number Puzzles: Which is Better for Your Brain?',
    excerpt: 'We compare Sudoku, Crosswords, and Anagram games to see which gives your brain the best workout.',
    category: 'Science',
    date: 'May 15, 2026',
    readTime: 6,
    slug: 'word-games-vs-number-puzzles',
  },
];

const categoryColors = {
  Science: '#3b82f6',
  Strategy: '#10b981',
  Education: '#8b5cf6',
  History: '#f59e0b',
};

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
      padding: '20px',
      paddingBottom: '80px',
    }}>
      <Helmet>
        <title>Word Blog | Word Scrambl</title>
        <meta name="description" content="Explore word origins, puzzle strategies, and vocabulary tips from the Word Scrambl word game." />
      </Helmet>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Word Blog</span>
          <div style={{ width: 42 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <BookOpen size={40} color="#60a5fa" style={{ marginBottom: '10px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto' }}>
            Explore word origins, puzzle strategies, and vocabulary tips.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {blogPosts.map((post, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '22px',
                backdropFilter: 'blur(20px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => window.open(`https://wordscrambl.com/blog/${post.slug}.html`, '_blank')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  background: `${categoryColors[post.category] || '#64748b'}22`,
                  color: categoryColors[post.category] || '#64748b',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {post.category}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{post.date}</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.3 }}>
                {post.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                {post.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>{post.readTime} min read</span>
                <ExternalLink size={14} color="rgba(255,255,255,0.25)" />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
            Full blog available at{' '}
            <a 
              href="https://wordscrambl.com/blog/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'none' }}
            >
              wordscrambl.com/blog
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
