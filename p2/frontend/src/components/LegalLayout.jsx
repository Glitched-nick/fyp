import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Shared layout for legal pages with sticky TOC + smooth scroll + active highlighting.
 *
 * Props:
 *   title      – page heading
 *   sections   – [{ id, label, content: ReactNode }]
 */
const LegalLayout = ({ title, sections }) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const observerRef = useRef(null);

  useEffect(() => {
    const headings = sections.map(s => document.getElementById(s.id)).filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );

    headings.forEach(h => observerRef.current.observe(h));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex gap-10">
          {/* ── Sticky TOC sidebar ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                On this page
              </p>
              <nav>
                <ul className="space-y-1">
                  {sections.map(s => (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-all duration-200 ${
                          activeId === s.id
                            ? 'bg-violet-600/20 text-violet-300 font-medium border-l-2 border-violet-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Cross-links to other legal pages */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                  Legal
                </p>
                <ul className="space-y-1">
                  {[
                    { label: 'Privacy Policy', to: '/privacy' },
                    { label: 'Terms of Service', to: '/terms' },
                    { label: 'Security', to: '/security' },
                    { label: 'Cookie Policy', to: '/cookies' },
                  ].map(l => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="block text-sm text-gray-400 hover:text-white px-3 py-1 rounded-md hover:bg-white/5 transition-all"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-10">{title}</h1>

            <div className="space-y-12 text-gray-300 leading-relaxed">
              {sections.map(s => (
                <section key={s.id} id={s.id} className="scroll-mt-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">{s.label}</h2>
                  {s.content}
                </section>
              ))}

              <p className="text-sm text-gray-500 pt-4 border-t border-white/10">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
