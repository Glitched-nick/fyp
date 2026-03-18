import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-3">404</p>
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-slate-300 mb-8">
          The page you are trying to open does not exist. Use one of the actions below to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors font-semibold"
          >
            Go to Home
          </Link>
          <Link
            to="/interview-selection"
            className="px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors font-semibold"
          >
            Start Interview
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
