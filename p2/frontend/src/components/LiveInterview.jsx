import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, SkipForward, FileText, Briefcase } from 'lucide-react'
import { startAIInterview, submitAnswer, completeInterview } from '../api/api'

function LiveInterview() {
  const [step, setStep] = useState('setup')
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSessionId, setAiSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [duration, setDuration] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [overallResults, setOverallResults] = useState(null)
  
  const videoRef = useRef(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const frameIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const startTimeRef = useRef(null)
  
  const navigate = useNavigate()

  const handleStartInterview = async (e) => {
    e.preventDefault()
    if (!resume || !jobDescription.trim()) {
      alert('Please upload a resume and provide a job description')
      return
    }
    setIsGenerating(true)
    try {
      const response = await startAIInterview(resume, jobDescription, numQuestions)
      if (response.success) {
        setAiSessionId(response.session_id)
        setQuestions(response.questions)
        setStep('interview')
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      alert(error.response?.data?.detail || 'Failed to start interview')
    } finally {
      setIsGenerating(false)
    }
  }

  const startInterview = async () => {
    try {
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: { echoCancellation: true, noiseSuppression: true }
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        try {
          wsRef.current = new WebSocket('ws://localhost:8000/api/live')
          wsRef.current.onopen = () => {
            setWsConnected(true)
            wsRef.current.send(JSON.stringify({ type: 'init', session_id: newSessionId, start_time: Date.now() }))
          }
          wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'metrics') setMetrics(data.data)
          }
          wsRef.current.onerror = () => console.log('WebSocket error')
        } catch (wsError) {
          console.log('Could not connect WebSocket')
        }
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        frameIntervalRef.current = setInterval(() => {
          if (videoRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            ctx.drawImage(videoRef.current, 0, 0)
            wsRef.current.send(JSON.stringify({ frame: canvas.toDataURL('image/jpeg', 0.8) }))
          }
        }, 200)
      } catch (mediaError) {
        console.error('Media access error:', mediaError)
        const proceed = confirm('Could not access camera/microphone. Continue without video?')
        if (!proceed) return
      }
      startTimeRef.current = Date.now()
      startQuestionRecording()
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Failed to start interview: ' + error.message)
    }
  }

  const startQuestionRecording = () => {
    audioChunksRef.current = []
    if (!startTimeRef.current) startTimeRef.current = Date.now()
    if (streamRef.current) {
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType })
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data)
        }
        mediaRecorderRef.current.start(1000)
      } catch (error) {
        console.error('Could not start MediaRecorder:', error)
      }
    }
    setIsRecording(true)
    setDuration(0)
    timerIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const finishQuestion = async () => {
    if (duration < 5) {
      alert('Please answer for at least 5 seconds')
      return
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(true)
    try {
      let response
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        response = await submitAnswer(aiSessionId, currentQuestionIndex, audioBlob, null, duration)
      } else {
        response = await submitAnswer(aiSessionId, currentQuestionIndex, null, `Answer ${currentQuestionIndex + 1}`, duration)
      }
      if (response.success) {
        setAnswers([...answers, {
          question: questions[currentQuestionIndex].question,
          answer: response.answer_text,
          score: response.analysis.score,
          feedback: response.analysis.feedback
        }])
      }
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setTimeout(() => startQuestionRecording(), 1000)
      } else {
        finishInterview()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer')
    } finally {
      setIsSaving(false)
    }
  }

  const finishInterview = async () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    if (wsRef.current) wsRef.current.close()
    setIsRecording(false)
    setWsConnected(false)
    try {
      const response = await completeInterview(aiSessionId)
      if (response.success) {
        setOverallResults(response.overall_results)
        setAnswers(response.detailed_answers)
        setStep('results')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      alert('Failed to get results')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (wsRef.current) wsRef.current.close()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
    }
  }, [])


  return (
    <AnimatePresence mode="wait">
      {step === 'setup' && (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Live AI Interview</h2>
            <p className="text-gray-400">Practice with real-time video analysis and AI-generated questions</p>
          </div>

          <form onSubmit={handleStartInterview} className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-3">
                <FileText className="w-4 h-4" />
                <span>Upload Resume (PDF, DOCX, or TXT)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setResume(e.target.files[0])}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6
                    file:rounded-xl file:border-0 file:text-sm file:font-semibold
                    file:bg-gradient-accent file:text-white hover:file:shadow-xl
                    file:transition-all file:cursor-pointer
                    bg-white/5 border border-white/10 rounded-xl p-3
                    hover:border-blue-500/50 transition-colors cursor-pointer"
                  required
                />
                {resume && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 flex items-center space-x-2 text-sm text-green-400"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>{resume.name}</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-3">
                <Briefcase className="w-4 h-4" />
                <span>Job Description</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-white placeholder-gray-500 transition-all resize-none"
                placeholder="Paste the job description here..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <motion.button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                      numQuestions === num
                        ? 'bg-gradient-accent text-white professional-glow'
                        : 'glass glass-hover text-gray-300'
                    }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-accent text-white rounded-xl font-semibold 
                text-lg flex items-center justify-center space-x-2 professional-glow
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Live Interview</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      )}

      {step === 'interview' && (
        <motion.div
          key="interview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Left Panel - AI Interviewer */}
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="font-semibold text-white">AI Interviewer</div>
                  <div className="text-sm text-gray-400">
                    {isRecording ? 'Listening...' : 'Ready to begin'}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-mono text-blue-400">{formatTime(duration)}</div>
            </div>

            {/* Question Display */}
            <div className="glass rounded-xl p-6 mb-6 min-h-[200px] flex items-center border border-white/5">
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <p className="text-lg text-gray-200 leading-relaxed">
                  {questions[currentQuestionIndex]?.question}
                </p>
                <div className="mt-3">
                  <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                    {questions[currentQuestionIndex]?.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              {!isRecording && answers.length === 0 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startInterview}
                  className="flex-1 px-6 py-3 bg-gradient-accent text-white rounded-xl font-semibold 
                    flex items-center justify-center space-x-2 professional-glow"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Interview</span>
                </motion.button>
              ) : isRecording && !isSaving ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={finishQuestion}
                  disabled={duration < 5}
                  className="flex-1 px-6 py-3 glass glass-hover text-white rounded-xl font-semibold 
                    flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <SkipForward className="w-5 h-5" />
                  <span>{duration < 5 ? `Wait ${5 - duration}s` : 'Next Question'}</span>
                </motion.button>
              ) : isSaving ? (
                <div className="flex-1 px-6 py-3 glass text-white rounded-xl font-semibold 
                  flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : null}
            </div>

            {answers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3"
              >
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>{answers.length} of {questions.length} questions answered</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - User Video */}
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Your Video</h3>
                <p className="text-sm text-gray-400">AI is analyzing in real-time</p>
              </div>
              {wsConnected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              )}
            </div>

            {/* Video Preview */}
            <div className="relative bg-dark-800 rounded-xl overflow-hidden mb-6 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isRecording && answers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center glass">
                  <div className="text-center">
                    <p className="text-white text-lg mb-2">Ready to start</p>
                    <p className="text-gray-400 text-sm">Click Start Interview</p>
                  </div>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 glass px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">Recording</span>
                </div>
              )}
            </div>

            {/* Real-time Metrics */}
            {metrics && !metrics.no_face && (
              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-lg p-4 text-center border border-white/5">
                  <div className="text-2xl font-bold text-blue-400">
                    {(metrics.eye_contact * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Eye Contact</div>
                </div>
                <div className="glass rounded-lg p-4 text-center border border-white/5">
                  <div className="text-2xl font-bold text-purple-400">
                    {(metrics.head_stability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Stability</div>
                </div>
                <div className="glass rounded-lg p-4 text-center border border-white/5">
                  <div className="text-2xl font-bold text-pink-400">
                    {(metrics.smile * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Engagement</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {step === 'results' && overallResults && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl"
          >
            <div className="text-center mb-6">
              <span className="text-6xl mb-4 block">🎉</span>
              <h3 className="text-3xl font-bold mb-2">Interview Complete!</h3>
              <p className="text-blue-100">Here's how you performed</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-5xl font-bold mb-2">{overallResults.overall_score}</p>
                <p className="text-sm opacity-90">Overall</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-5xl font-bold mb-2">{overallResults.technical_score}</p>
                <p className="text-sm opacity-90">Technical</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-5xl font-bold mb-2">{overallResults.behavioral_score}</p>
                <p className="text-sm opacity-90">Behavioral</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Detailed Feedback</h4>
            {answers.map((answer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white mb-3">{answer.question}</p>
                    <p className="text-sm text-gray-400 mb-4">{answer.answer?.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        answer.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        answer.score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        Score: {answer.score}/100
                      </span>
                      <p className="text-sm text-gray-400">{answer.feedback}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex space-x-4">
            <motion.button
              onClick={() => {
                setStep('setup')
                setAiSessionId(null)
                setQuestions([])
                setCurrentQuestionIndex(0)
                setAnswers([])
                setOverallResults(null)
                setResume(null)
                setJobDescription('')
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-accent text-white rounded-xl font-semibold professional-glow"
            >
              Start New Interview
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 glass glass-hover text-white rounded-xl font-semibold"
            >
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LiveInterview
