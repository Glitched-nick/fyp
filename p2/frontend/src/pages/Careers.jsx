import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Heart, Rocket } from 'lucide-react';

const Careers = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Careers at Intrex</h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            We are always looking for passionate and talented individuals to join our team. If you're
            interested in working on impactful projects and growing your skills, we'd love to hear from you.
          </p>
        </div>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Why Join Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket,
                title: 'Impactful Work',
                desc: 'Build tools that directly help people land their dream jobs and grow their careers.',
              },
              {
                icon: Heart,
                title: 'People First',
                desc: 'We value well-being, collaboration, and a culture where everyone can do their best work.',
              },
              {
                icon: Briefcase,
                title: 'Grow Fast',
                desc: 'Work across the full stack, take ownership, and level up your skills on real problems.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-900 p-6 rounded-lg border border-slate-800 hover:border-violet-500/40 transition-colors">
                <Icon className="w-8 h-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Open Positions</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No open roles right now</h3>
            <p className="text-gray-400 mb-6">
              Stay tuned for upcoming opportunities. We're growing and new positions will be posted here.
            </p>
            <a
              href="https://www.linkedin.com/in/utkarsh-rai-698a57220/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium"
            >
              Follow us on LinkedIn for updates
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Careers;
