import fs from 'fs';
import path from 'path';
import { blogPosts } from './blogPosts.js';

const DIST = 'dist_production';
const SITE_URL = 'https://wordscrambl.com';

// ── Shared HTML Template ──────────────────────────────────────────────
function htmlTemplate({ title, description, slug, bodyContent, isHome = false, breadcrumb = '' }) {
  const canonical = slug ? `${SITE_URL}/${slug}` : SITE_URL;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | SCRAMBL Word Game</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title} | SCRAMBL">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${SITE_URL}/scrambl-social.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} | SCRAMBL">
  <meta name="twitter:description" content="${description}">
  <link rel="icon" type="image/svg+xml" href="/vite.svg">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${getStyles()}</style>
</head>
<body>
  <header class="site-header">
    <nav class="nav-container">
      <a href="/" class="nav-logo">SCRAMBL</a>
      <div class="nav-links">
        <a href="/">Play Game</a>
        <a href="/blog/">Blog</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </div>
    </nav>
  </header>
  ${breadcrumb ? `<nav class="breadcrumb" aria-label="Breadcrumb"><div class="container">${breadcrumb}</div></nav>` : ''}
  <main class="main-content">
    <div class="container">
      ${bodyContent}
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>SCRAMBL</h3>
          <p>The ultimate word puzzle adventure. Unscramble words, solve mysteries, and travel the world — one puzzle at a time.</p>
        </div>
        <div class="footer-col">
          <h3>Play</h3>
          <a href="/">Play Now</a>
          <a href="/how-to-play.html">How to Play</a>
          <a href="/blog/">Word Blog</a>
        </div>
        <div class="footer-col">
          <h3>Company</h3>
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} SCRAMBL by GoodDude Studios. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ── CSS Styles ────────────────────────────────────────────────────────
function getStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fcfdfe; line-height: 1.7; }
    .container { max-width: 780px; margin: 0 auto; padding: 0 20px; }
    a { color: #1a5d1a; text-decoration: none; transition: color .2s; }
    a:hover { color: #2e7d32; text-decoration: underline; }

    /* Header */
    .site-header { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 780px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 1.6rem; font-weight: 800; color: #1a5d1a; letter-spacing: -1px; text-decoration: none; }
    .nav-links { display: flex; gap: 24px; font-weight: 500; font-size: 0.95rem; }
    .nav-links a { color: #475569; }
    .nav-links a:hover { color: #1a5d1a; text-decoration: none; }

    /* Breadcrumb */
    .breadcrumb { background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; color: #64748b; padding: 10px 0; }
    .breadcrumb a { color: #1a5d1a; }

    /* Main */
    .main-content { min-height: 60vh; padding: 40px 0 60px; }

    /* Article */
    .article-header { margin-bottom: 32px; }
    .article-meta { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; font-size: 0.85rem; color: #64748b; flex-wrap: wrap; }
    .article-category { background: rgba(26,93,26,0.08); color: #1a5d1a; padding: 3px 12px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .article-header h1 { font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 16px; }
    .article-header .lead { font-size: 1.15rem; color: #475569; line-height: 1.6; }

    /* Article body */
    .article-body h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 36px 0 14px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
    .article-body h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 24px 0 10px; }
    .article-body p { margin-bottom: 18px; color: #334155; }
    .article-body ul, .article-body ol { margin: 0 0 18px 24px; color: #334155; }
    .article-body li { margin-bottom: 8px; }
    .article-body blockquote { border-left: 4px solid #1a5d1a; padding: 16px 20px; margin: 24px 0; background: #f0fdf4; border-radius: 0 12px 12px 0; font-style: italic; color: #1e293b; }
    .article-body strong { color: #0f172a; }

    /* CTA box */
    .cta-box { background: linear-gradient(135deg, #1a5d1a 0%, #2e7d32 100%); color: #fff; padding: 32px; border-radius: 16px; text-align: center; margin: 40px 0; }
    .cta-box h3 { font-size: 1.4rem; margin-bottom: 10px; }
    .cta-box p { opacity: 0.9; margin-bottom: 18px; }
    .cta-box a { display: inline-block; background: #fff; color: #1a5d1a; padding: 12px 32px; border-radius: 30px; font-weight: 700; text-decoration: none; transition: transform .2s; }
    .cta-box a:hover { transform: translateY(-2px); text-decoration: none; }

    /* Blog listing */
    .blog-hero { text-align: center; margin-bottom: 48px; }
    .blog-hero h1 { font-size: 2.4rem; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .blog-hero p { font-size: 1.1rem; color: #64748b; max-width: 550px; margin: 0 auto; }
    .post-grid { display: grid; gap: 24px; }
    .post-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; transition: all .3s; }
    .post-card:hover { border-color: #1a5d1a; box-shadow: 0 8px 30px rgba(0,0,0,0.06); transform: translateY(-2px); }
    .post-card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
    .post-card h2 a { color: #0f172a; }
    .post-card h2 a:hover { color: #1a5d1a; text-decoration: none; }
    .post-card .excerpt { color: #64748b; font-size: 0.95rem; margin-bottom: 12px; }
    .post-card .card-meta { font-size: 0.8rem; color: #94a3b8; display: flex; gap: 12px; }

    /* Static pages */
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    .page-header p { color: #64748b; font-size: 1.05rem; }
    .page-body h2 { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 32px 0 12px; }
    .page-body p { color: #334155; margin-bottom: 16px; }
    .page-body ul { margin: 0 0 16px 24px; color: #334155; }
    .page-body li { margin-bottom: 6px; }
    .contact-email { font-size: 1.2rem; font-weight: 700; color: #1a5d1a; }

    /* Footer */
    .site-footer { background: #0f172a; color: #cbd5e1; padding: 50px 0 30px; margin-top: 60px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .footer-col h3 { color: #fff; font-size: 1rem; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .footer-col p { font-size: 0.9rem; line-height: 1.6; }
    .footer-col a { display: block; color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; }
    .footer-col a:hover { color: #fff; text-decoration: none; }
    .footer-bottom { border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; font-size: 0.85rem; color: #64748b; }

    @media (max-width: 640px) {
      .nav-links { gap: 14px; font-size: 0.85rem; }
      .article-header h1 { font-size: 1.7rem; }
      .blog-hero h1 { font-size: 1.8rem; }
      .footer-grid { grid-template-columns: 1fr; gap: 24px; }
    }
  `;
}

// ── Generate Blog Post Page ────────────────────────────────────────────
function generatePost(post) {
  const breadcrumb = `<a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>${post.title}</span>`;
  const bodyContent = `
    <article>
      <div class="article-header">
        <div class="article-meta">
          <span class="article-category">${post.category}</span>
          <span>${post.date}</span>
          <span>${post.readTime} min read</span>
        </div>
        <h1>${post.title}</h1>
        <p class="lead">${post.lead}</p>
      </div>
      <div class="article-body">
        ${post.content}
        <div class="cta-box">
          <h3>Ready to Test Your Skills?</h3>
          <p>Put your word knowledge to the test with over 1,450 puzzles across 60 countries.</p>
          <a href="/">Play SCRAMBL Now</a>
        </div>
      </div>
    </article>`;
  return htmlTemplate({ title: post.title, description: post.lead, slug: `blog/${post.slug}.html`, bodyContent, breadcrumb });
}

// ── Generate Blog Index ────────────────────────────────────────────────
function generateBlogIndex() {
  const cards = blogPosts.map(p => `
    <div class="post-card">
      <div class="card-meta"><span class="article-category">${p.category}</span><span>${p.date}</span></div>
      <h2><a href="/blog/${p.slug}.html">${p.title}</a></h2>
      <p class="excerpt">${p.lead}</p>
      <div class="card-meta"><span>${p.readTime} min read</span></div>
    </div>`).join('\n');

  const bodyContent = `
    <div class="blog-hero">
      <h1>The SCRAMBL Word Blog</h1>
      <p>Explore fascinating word origins, puzzle-solving strategies, and vocabulary tips from the world of SCRAMBL.</p>
    </div>
    <div class="post-grid">${cards}</div>`;
  return htmlTemplate({ title: 'Word Blog', description: 'Explore word origins, puzzle strategies, and vocabulary tips from SCRAMBL.', slug: 'blog/', bodyContent, isHome: true });
}

// ── Generate About Page ────────────────────────────────────────────────
function generateAboutPage() {
  const bodyContent = `
    <div class="page-header">
      <h1>About SCRAMBL</h1>
      <p>The story behind the world's most addictive word puzzle game.</p>
    </div>
    <div class="page-body">
      <p>SCRAMBL is an independent word puzzle game created by a passionate solo developer with a love for language, learning, and brain teasers. What started as a weekend project in 2025 has grown into a game with <strong>over 1,450 handcrafted puzzles spanning 60 countries</strong> around the world.</p>
      <h2>Our Mission</h2>
      <p>We believe that learning should be fun. SCRAMBL combines the thrill of solving anagrams with the joy of discovering new words and exploring different cultures. Every puzzle is designed to challenge your vocabulary, sharpen your mind, and teach you something new — whether it's the meaning of an unfamiliar word or a fun fact about a distant country.</p>
      <h2>How SCRAMBL Works</h2>
      <p>Each level presents you with a set of jumbled words. Unscramble them, identify the circled letters, and use those letters to solve a final mystery word. It's simple to learn but endlessly challenging — the kind of game you can pick up in seconds but keep coming back to for months.</p>
      <h2>Built with Care</h2>
      <p>SCRAMBL is built by <strong>GoodDude Studios</strong>, an indie game studio focused on creating thoughtful, ad-light games that respect your time and attention. We don't believe in pay-to-win mechanics or manipulative dark patterns. Just pure, satisfying word puzzles.</p>
      <h2>Available Everywhere</h2>
      <p>SCRAMBL is available as a free web game at <a href="https://wordscrambl.com">wordscrambl.com</a>, on the <strong>Google Play Store</strong> for Android devices, and on popular gaming portals like <strong>CrazyGames</strong>. Wherever you are, there's a puzzle waiting for you.</p>
      <h2>Get in Touch</h2>
      <p>We love hearing from our players! Whether you have feedback, found a bug, or just want to say hi, reach out to us at <a href="mailto:kush@wordscrambl.com" class="contact-email">kush@wordscrambl.com</a>.</p>
    </div>`;
  return htmlTemplate({ title: 'About Us', description: 'Learn about SCRAMBL, the indie word puzzle game with 1,450+ puzzles across 60 countries.', slug: 'about.html', bodyContent });
}

// ── Generate Contact Page ──────────────────────────────────────────────
function generateContactPage() {
  const bodyContent = `
    <div class="page-header">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you.</p>
    </div>
    <div class="page-body">
      <p>Whether you have a question about SCRAMBL, want to report a bug, have a partnership inquiry, or just want to share your high score — we're all ears!</p>
      <h2>Email Us</h2>
      <p>The best way to reach us is by email:</p>
      <p><a href="mailto:kush@wordscrambl.com" class="contact-email">kush@wordscrambl.com</a></p>
      <p>We typically respond within 24-48 hours.</p>
      <h2>What to Include</h2>
      <ul>
        <li><strong>Bug reports:</strong> Please describe the issue, what device/browser you're using, and include a screenshot if possible.</li>
        <li><strong>Feedback:</strong> Tell us what you love, what you'd change, or what features you'd like to see.</li>
        <li><strong>Partnership inquiries:</strong> If you're interested in featuring SCRAMBL on your platform or collaborating, let us know!</li>
        <li><strong>Press:</strong> For media inquiries, please email us with "Press" in the subject line.</li>
      </ul>
      <h2>Follow Us</h2>
      <p>Stay up to date with new puzzles, features, and word-nerd content:</p>
      <ul>
        <li>Play SCRAMBL at <a href="https://wordscrambl.com">wordscrambl.com</a></li>
        <li>Download on <a href="#">Google Play Store</a></li>
      </ul>
      <h2>About GoodDude Studios</h2>
      <p>SCRAMBL is developed by GoodDude Studios, an independent game studio dedicated to creating fun, thoughtful puzzle games. Learn more on our <a href="/about.html">About page</a>.</p>
    </div>`;
  return htmlTemplate({ title: 'Contact Us', description: 'Get in touch with the SCRAMBL team. Report bugs, share feedback, or inquire about partnerships.', slug: 'contact.html', bodyContent });
}

// ── Generate How to Play Page ──────────────────────────────────────────
function generateHowToPlayPage() {
  const bodyContent = `
    <div class="page-header">
      <h1>How to Play SCRAMBL</h1>
      <p>Your complete guide to mastering the world's most addictive word puzzle.</p>
    </div>
    <div class="page-body">
      <h2>The Basics</h2>
      <p>SCRAMBL is a word puzzle game where you unscramble jumbled letters to form real English words. Each level contains multiple jumbled words and a final mystery word that ties everything together.</p>
      
      <h2>Step 1: Unscramble the Jumbles</h2>
      <p>Each level starts with 2-3 jumbled words displayed on screen. Look at the scrambled letters and figure out what word they spell. For example, if you see <strong>RATS</strong>, the answer is <strong>STAR</strong>. Type your answer letter by letter into the input boxes.</p>
      
      <h2>Step 2: Watch the Circled Letters</h2>
      <p>Some letter positions are marked with circles (shown as dashed orange borders). When you solve a jumble, the letters in the circled positions become important — they're the building blocks for the final mystery word!</p>
      
      <h2>Step 3: Solve the Mystery Word</h2>
      <p>After solving all the jumbles, the circled letters are collected and scrambled one more time. Your job is to unscramble these collected letters into the final answer. A hint or clue is provided to help guide you.</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li><strong>Start with vowels:</strong> Identify the vowels first. Most English words have predictable vowel-consonant patterns.</li>
        <li><strong>Look for common prefixes and suffixes:</strong> Endings like -ED, -ING, -TION, or beginnings like UN-, RE-, PRE- can help you crack the word faster.</li>
        <li><strong>Try different combinations:</strong> If you're stuck, focus on the first and last letters — they're often the easiest to identify.</li>
        <li><strong>Use the hint button:</strong> Watch a short video to reveal one letter of the mystery word. Sometimes one letter is all you need!</li>
        <li><strong>Don't overthink it:</strong> The answers are common English words. If your guess sounds obscure, try a simpler word.</li>
      </ul>
      
      <h2>Progression System</h2>
      <p>SCRAMBL features over <strong>1,450 puzzles</strong> organized by country. You'll start in Australia and travel through 60 countries as you progress. Each country has its own set of puzzles and a unique background theme.</p>
      
      <h2>Earning Coins</h2>
      <p>You earn <strong>2 coins</strong> for every level you complete. Coins can be used in the Shop to unlock special features. Completing puzzles without hints earns you bragging rights!</p>
      
      <h2>Save Your Progress</h2>
      <p>Create a free account to save your progress across devices. Sign in with your email and never lose your streak — even if you switch from your phone to your computer.</p>
      
      <div class="cta-box">
        <h3>Ready to Start Unscrambling?</h3>
        <p>Jump into your first puzzle right now. No download required!</p>
        <a href="/">Play SCRAMBL Free</a>
      </div>
    </div>`;
  return htmlTemplate({ title: 'How to Play', description: 'Learn how to play SCRAMBL word puzzles. Complete guide with tips, strategies, and game mechanics explained.', slug: 'how-to-play.html', bodyContent });
}

// ── Generate Sitemap ───────────────────────────────────────────────────
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: SITE_URL + '/', priority: '1.0', freq: 'daily' },
    { loc: SITE_URL + '/blog/', priority: '0.9', freq: 'weekly' },
    { loc: SITE_URL + '/about.html', priority: '0.7', freq: 'monthly' },
    { loc: SITE_URL + '/contact.html', priority: '0.7', freq: 'monthly' },
    { loc: SITE_URL + '/how-to-play.html', priority: '0.8', freq: 'monthly' },
    { loc: SITE_URL + '/privacy', priority: '0.3', freq: 'yearly' },
    { loc: SITE_URL + '/terms', priority: '0.3', freq: 'yearly' },
    ...blogPosts.map(p => ({ loc: `${SITE_URL}/blog/${p.slug}.html`, priority: '0.8', freq: 'monthly' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// ── Generate robots.txt ────────────────────────────────────────────────
function generateRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;
}

// ── Main Build ─────────────────────────────────────────────────────────
function build() {
  console.log('🔨 Generating blog pages...\n');

  // Ensure directories
  fs.mkdirSync(path.join(DIST, 'blog'), { recursive: true });

  // Blog posts
  blogPosts.forEach(post => {
    const html = generatePost(post);
    fs.writeFileSync(path.join(DIST, 'blog', `${post.slug}.html`), html);
    console.log(`  ✅ blog/${post.slug}.html`);
  });

  // Blog index
  fs.writeFileSync(path.join(DIST, 'blog', 'index.html'), generateBlogIndex());
  console.log('  ✅ blog/index.html');

  // Static pages
  fs.writeFileSync(path.join(DIST, 'about.html'), generateAboutPage());
  console.log('  ✅ about.html');

  fs.writeFileSync(path.join(DIST, 'contact.html'), generateContactPage());
  console.log('  ✅ contact.html');

  fs.writeFileSync(path.join(DIST, 'how-to-play.html'), generateHowToPlayPage());
  console.log('  ✅ how-to-play.html');

  // SEO files
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), generateSitemap());
  console.log('  ✅ sitemap.xml');

  fs.writeFileSync(path.join(DIST, 'robots.txt'), generateRobots());
  console.log('  ✅ robots.txt');

  console.log(`\n🎉 Generated ${blogPosts.length} blog posts + 5 static pages.`);
  console.log(`📂 Output: ${DIST}/`);
}

build();
