import { useState } from 'react'
import Navbar from '../components/Navbar'
import UploadForm from '../components/UploadForm'
import LiveInterview from '../components/LiveInterview'
import AIInterview from '../components/AIInterview'

function Home() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Analyze Your Interview Performance
            </h2>
            <p className="text-gray-400 text-lg">
              Get AI-powered feedback on your facial expressions, body language, speech patterns, and answers
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-surface-border mb-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🤖 AI Interview
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'live'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎥 Live Interview
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && <UploadForm />}
          {activeTab === 'ai' && <AIInterview />}
          {activeTab === 'live' && <LiveInterview />}

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">👁️</div>
              <h3 className="font-semibold mb-2 text-white">Facial Analysis</h3>
              <p className="text-sm text-gray-400">
                Eye contact, head stability, and expressions
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="font-semibold mb-2 text-white">Speech Analysis</h3>
              <p className="text-sm text-gray-400">
                Speech rate, filler words, and clarity
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2 text-white">AI Questions</h3>
              <p className="text-sm text-gray-400">
                Personalized questions from your resume
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold mb-2 text-white">Detailed Feedback</h3>
              <p className="text-sm text-gray-400">
                Actionable insights to improve
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
