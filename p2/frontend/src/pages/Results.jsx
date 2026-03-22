import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Sparkles, RefreshCw } from 'lucide-react'
import { getResults } from '../api/api'
import CircularScore from '../components/CircularScore'

// ── Inline metric bar ──────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 1, unit = '%', color = '#6D5BFF' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span style={{ color }}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ── Stat chip ──────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div className="glass rounded-xl p-4 text-center border border-white/10">
      <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

// ── Main Results page ──────────────────────────────────────────────────────────
function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const results = await getResults(id)
        setData(results)
      } catch (err) {
        setError(err.message || 'Failed to load results')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [id])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading your results...</p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-purple-900 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 border border-red-500/30 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Could not load results</h2>
          <p className="text-red-400 mb-6">{error || 'Results not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const {
    confidence_score = 0,
    facial_metrics = {},
    speech_metrics = {},
    strengths = [],
    improvements = [],
    video_duration = 0,
    timestamp,
  } = data

  const fm = facial_metrics
  const sm = speech_metrics

  // Derive a simple readiness label
  const readiness =
    confidence_score >= 80 ? 'Interview Ready' :
    confidence_score >= 60 ? 'Nearly Ready' : 'Needs Practice'

  const readinessColor =
    confidence_score >= 80 ? '#10b981' :
    confidence_score >= 60 ? '#f59e0b' : '#ef4444'

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString()
    : 'N/A'

  const durationMin = video_duration
    ? `${Math.floor(video_duration / 60)}m ${Math.round(video_duration % 60)}s`
    : 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-purple-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Intrex</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/video-upload')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                New Analysis
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Video Interview Analysis</h1>
            <p className="text-gray-400">Analyzed on {formattedDate} · Duration: {durationMin}</p>
          </motion.div>

          {/* Score + quick stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Circular score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-8 border border-white/10 flex flex-col items-center"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Confidence Score</h2>
              <CircularScore score={confidence_score} size={200} />
              <div
                className="mt-6 px-5 py-2 rounded-full border font-semibold text-sm"
                style={{ color: readinessColor, borderColor: readinessColor, backgroundColor: `${readinessColor}18` }}
              >
                {readiness}
              </div>
            </motion.div>

            {/* Quick stat chips */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatChip
                  label="Eye Contact"
                  value={`${((fm.eye_contact_score ?? 0) * 100).toFixed(0)}%`}
                  color="#6D5BFF"
                />
                <StatChip
                  label="Head Stability"
                  value={`${((fm.head_stability_score ?? 0) * 100).toFixed(0)}%`}
                  color="#00D4FF"
                />
                <StatChip
                  label="Speech Rate"
                  value={`${(sm.speech_rate ?? 0).toFixed(0)} wpm`}
                  color="#10F0A0"
                />
                <StatChip
                  label="Filler Words"
                  value={`${(sm.filler_percentage ?? 0).toFixed(1)}%`}
                  color="#F59E0B"
                />
              </div>
            </motion.div>
          </div>

          {/* Strengths + Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Strengths */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>💪</span> Strengths
              </h3>
              <div className="space-y-3">
                {strengths.length > 0 ? strengths.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3"
                  >
                    <span className="text-green-400 font-bold text-sm mt-0.5">{i + 1}</span>
                    <p className="text-white text-sm flex-1">{s}</p>
                  </motion.div>
                )) : (
                  <p className="text-gray-500 text-sm">No strengths data available</p>
                )}
              </div>
            </div>

            {/* Improvements */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <span>🎯</span> Areas for Improvement
              </h3>
              <div className="space-y-3">
                {improvements.length > 0 ? improvements.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
                  >
                    <span className="text-amber-400 font-bold text-sm mt-0.5">{i + 1}</span>
                    <p className="text-white text-sm flex-1">{imp}</p>
                  </motion.div>
                )) : (
                  <p className="text-gray-500 text-sm">No improvement suggestions available</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Facial metrics detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span>👁️</span> Facial Analysis
              </h3>
              <MetricBar label="Eye Contact" value={(fm.eye_contact_score ?? 0) * 100} max={100} unit="%" color="#6D5BFF" />
              <MetricBar label="Head Stability" value={(fm.head_stability_score ?? 0) * 100} max={100} unit="%" color="#00D4FF" />
              <MetricBar label="Smile Score" value={(fm.smile_score ?? 0) * 100} max={100} unit="%" color="#10F0A0" />
              <MetricBar label="Face Presence" value={(fm.face_presence_percentage ?? 0) * 100} max={100} unit="%" color="#F59E0B" />
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span>🎙️</span> Speech Analysis
              </h3>
              <MetricBar label="Speech Rate" value={sm.speech_rate ?? 0} max={200} unit=" wpm" color="#6D5BFF" />
              <MetricBar label="Filler Words" value={sm.filler_percentage ?? 0} max={20} unit="%" color="#ef4444" />
              <MetricBar label="Energy Stability" value={(sm.energy_stability ?? 0) * 100} max={100} unit="%" color="#10F0A0" />
              <MetricBar label="Pitch Variance" value={sm.pitch_variance ?? 0} max={100} unit="" color="#F59E0B" />
            </div>
          </motion.div>

          {/* Transcript */}
          {sm.transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Transcript
              </h3>
              <div className="bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto border border-white/10">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{sm.transcript}</p>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => navigate('/video-upload')}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Analyze Another Video
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 glass border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
            >
              <span>📊</span>
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/interview-selection')}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
            >
              <span>🤖</span>
              Try AI Interview
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Results
