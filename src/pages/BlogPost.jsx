import { useParams, Link, Navigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { lazy, Suspense } from 'react';

// Dynamic content imports
const contentComponents = {
  'what-is-vpn-complete-guide': lazy(() => import('../data/blog-content/what-is-vpn-complete-guide.jsx')),
  'wireguard-vs-openvpn-comparison': lazy(() => import('../data/blog-content/wireguard-vs-openvpn-comparison.jsx')),
  'vpn-for-remote-work-security': lazy(() => import('../data/blog-content/vpn-for-remote-work-security.jsx')),
  'protect-privacy-online-2025': lazy(() => import('../data/blog-content/protect-privacy-online-2025.jsx')),
  'vpn-setup-guide-beginners': lazy(() => import('../data/blog-content/vpn-setup-guide-beginners.jsx')),
  'business-vpn-benefits': lazy(() => import('../data/blog-content/business-vpn-benefits.jsx')),
  'public-wifi-security-risks': lazy(() => import('../data/blog-content/public-wifi-security-risks.jsx')),
  'vpn-gaming-benefits': lazy(() => import('../data/blog-content/vpn-gaming-benefits.jsx')),
  'vpn-streaming-unblock-content': lazy(() => import('../data/blog-content/vpn-streaming-unblock-content.jsx')),
  'vpn-router-setup-guide': lazy(() => import('../data/blog-content/vpn-router-setup-guide.jsx')),
};

function ContentLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);
  const ContentComponent = contentComponents[slug];

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(tag => post.tags.includes(tag))))
    .slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | SACVPN Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        <link rel="canonical" href={`https://www.sacvpn.com/blog/${post.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Back Button */}
        <div className="pt-24 pb-8 px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-full font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-5 h-5" />
                  {post.readTime}
                </span>
                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Share article"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                {post.title}
              </h1>

              <p className="text-xl text-gray-300 mb-6">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3 text-gray-400">
                <span>By {post.author}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Featured Image Placeholder */}
            <div className="h-96 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl mb-12 flex items-center justify-center">
              <div className="text-9xl">🔒</div>
            </div>

            {/* Article Content - Dynamically loaded from blog content files */}
            <div className="prose prose-invert prose-lg max-w-none">
              {ContentComponent ? (
                <Suspense fallback={<ContentLoader />}>
                  <ContentComponent />
                </Suspense>
              ) : (
                <div id="blog-content">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Content is being prepared for this article. Please check back soon!
                  </p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Protect Your Privacy?
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Join thousands of users who trust SACVPN for fast, secure, and private internet access powered by WireGuard technology.
              </p>
              <Link
                to="/pricing"
                className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="pb-20 px-6 border-t border-gray-800 pt-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-10">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map(relatedPost => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all"
                  >
                    <div className="h-48 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-6xl">📝</div>
                    </div>
                    <div className="p-6">
                      <span className="text-sm text-red-400 mb-2 block">{relatedPost.category}</span>
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
