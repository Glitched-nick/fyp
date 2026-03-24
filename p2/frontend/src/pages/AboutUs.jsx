import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Zap, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">About Intrex</h1>
        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
          We are building a smart and efficient platform focused on enhancing user productivity and
          experience through modern technology. Our goal is to simplify complex processes and deliver
          intuitive solutions that help users perform better and faster.
        </p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p>
              With a focus on innovation, performance, and user-centric design, we continuously improve
              our platform to meet real-world needs. We aim to create tools that are not only powerful
              but also easy to use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Real-time Analysis',
                  desc: 'Instant feedback on interview performance including speech analysis and AI-powered scoring.',
                },
                {
                  icon: Zap,
                  title: 'AI-Powered Insights',
                  desc: 'Advanced AI analyzes your responses and presentation for actionable improvement suggestions.',
                },
                {
                  icon: Users,
                  title: 'Practice Anywhere',
                  desc: 'Flexible platform supporting both live and resume-based interview sessions.',
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

          <section className="bg-slate-900 p-8 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
            <p className="mb-6 text-gray-400">
              Have questions or want to connect? Reach out on LinkedIn or check out our blog.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.linkedin.com/in/utkarsh-rai-698a57220/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium"
              >
                Connect on LinkedIn
              </a>
              <a
                href="https://www.blogger.com/u/1/profile/07512910352667443882"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-medium"
              >
                Read our Blog
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
