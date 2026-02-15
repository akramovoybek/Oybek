import { Link } from 'react-router-dom';
import { Code2, Trophy, Users, ArrowRight, Zap, Target, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Competitive Programming Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Sharpen Your
              <span className="text-indigo-600"> Coding Skills</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Solve challenging problems, compete in contests, and track your progress.
              Join a community of developers pushing their limits.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Start Solving
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contests"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all border border-gray-200"
              >
                View Contests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to improve</h2>
            <p className="mt-3 text-gray-500">Practice, compete, and grow as a developer</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Practice Problems',
                desc: 'Curated problems across multiple difficulty levels and topics. Write Python solutions and get instant feedback.',
                color: 'indigo',
              },
              {
                icon: Trophy,
                title: 'Live Contests',
                desc: 'Compete in timed contests against other developers. Climb the leaderboard and earn your rating.',
                color: 'amber',
              },
              {
                icon: BarChart3,
                title: 'Track Progress',
                desc: 'Monitor your submissions, see your acceptance rate, and watch your skills grow over time.',
                color: 'emerald',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-8 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${f.color}-100 text-${f.color}-600 mb-5`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start coding?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Join now and start solving problems today.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Code2 className="w-5 h-5" />
            <span className="text-sm font-medium">CodeArena</span>
          </div>
          <p className="text-sm text-gray-400">Competitive Programming Platform</p>
        </div>
      </footer>
    </div>
  );
}
