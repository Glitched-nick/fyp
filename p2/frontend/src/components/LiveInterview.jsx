import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function LiveInterview() {
  // Step management
  const [step, setStep] = useState('setup') // setup, interview, results
  
  // Setup state
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Interview state
  const [aiSessionId, setAiSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [duration, setDuration] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  
  // Results state
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
      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('job_description', jobDescription)
      formData.append('num_questions', numQuestions)
      
      const response = await api.post('/ai-interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        setAiSessionId(response.data.session_id)
        setQuestions(response.data.questions)
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
      // Try to get camera and microphone
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: { echoCancellation: true, noiseSuppression: true }
        })
        
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Generate session ID for facial analysis
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)

        // Setup WebSocket for facial analysis
        try {
          wsRef.current = new WebSocket('ws://localhost:8000/api/live')
          wsRef.current.onopen = () => {
            setWsConnected(true)
            wsRef.current.send(JSON.stringify({
              type: 'init',
              session_id: newSessionId,
              start_time: Date.now()
            }))
          }
          wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'metrics') {
              setMetrics(data.data)
            }
          }
          wsRef.current.onerror = () => {
            console.log('WebSocket error - continuing without facial analysis')
          }
        } catch (wsError) {
          console.log('Could not connect WebSocket - continuing without facial analysis')
        }

        // Send video frames if WebSocket connected
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
        const proceed = confirm(
          'Could not access camera/microphone. This may be because:\n\n' +
          '• Permissions were denied\n' +
          '• No camera/microphone is connected\n' +
          '• Another app is using them\n\n' +
          'Continue without video? (Audio-only interview)'
        )
        
        if (!proceed) {
          return
        }
        
        // Continue without video - audio only
        console.log('Continuing in audio-only mode')
      }

      // Start recording first question
      startTimeRef.current = Date.now()
      startQuestionRecording()
      
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Failed to start interview: ' + error.message)
    }
  }

  const startQuestionRecording = () => {
    audioChunksRef.current = []
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }
    
    // Only setup MediaRecorder if we have a stream
    if (streamRef.current) {
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType })
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
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
    
    // Stop recording
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    
    // Wait for audio chunks
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Submit answer
    setIsSaving(true)
    try {
      // If no audio was recorded, create a dummy answer
      let answerText = `Sample answer for question ${currentQuestionIndex + 1}`
      
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('session_id', aiSessionId)
        formData.append('question_index', currentQuestionIndex)
        formData.append('answer_audio', audioBlob, 'answer.webm')
        formData.append('answer_duration', duration)
        
        const response = await api.post('/ai-interview/submit-answer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        if (response.data.success) {
          const newAnswer = {
            question: questions[currentQuestionIndex].question,
            answer: response.data.answer_text,
            score: response.data.analysis.score,
            feedback: response.data.analysis.feedback,
            metrics: response.data.analysis.metrics
          }
          setAnswers([...answers, newAnswer])
        }
      } else {
        // No audio - submit text answer
        const formData = new FormData()
        formData.append('session_id', aiSessionId)
        formData.append('question_index', currentQuestionIndex)
        formData.append('answer_text', answerText)
        formData.append('answer_duration', duration)
        
        const response = await api.post('/ai-interview/submit-answer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        if (response.data.success) {
          const newAnswer = {
            question: questions[currentQuestionIndex].question,
            answer: response.data.answer_text,
            score: response.data.analysis.score,
            feedback: response.data.analysis.feedback,
            metrics: response.data.analysis.metrics
          }
          setAnswers([...answers, newAnswer])
        }
      }
      
      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setTimeout(() => startQuestionRecording(), 1000)
      } else {
        finishInterview()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const finishInterview = async () => {
    // Stop everything
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (wsRef.current) wsRef.current.close()
    
    setIsRecording(false)
    setWsConnected(false)
    
    // Get final results
    try {
      console.log('Completing interview for session:', aiSessionId)
      
      const response = await api.post('/ai-interview/complete', {
        session_id: aiSessionId
      })
      
      console.log('Complete response:', response.data)
      
      if (response.data.success) {
        setOverallResults(response.data.overall_results)
        setAnswers(response.data.detailed_answers)
        setStep('results')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      console.error('Error response:', error.response?.data)
      alert('Failed to get results: ' + (error.response?.data?.detail || error.message))
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (wsRef.current) wsRef.current.close()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {step === 'setup' && '🎯 AI-Powered Live Interview'}
          {step === 'interview' && '🎤 Live Interview in Progress'}
          {step === 'results' && '📊 Interview Results'}
        </h2>
        <div className="flex items-center gap-4">
          {wsConnected && step === 'interview' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Camera Active</span>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono font-semibold">{formatTime(duration)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Setup Step */}
      {step === 'setup' && (
        <form onSubmit={handleStartInterview} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              📌 This interview combines AI question generation with live video analysis. 
              Upload your resume and job description to get started!
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Resume (PDF, DOCX, or TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setResume(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {resume && (
              <p className="mt-2 text-sm text-green-600">✓ {resume.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste the job description here..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={7}>7 Questions</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
              transition-colors duration-200 font-semibold disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating Questions...' : 'Start Live Interview'}
          </button>
        </form>
      )}
      
      {/* Interview Step */}
      {step === 'interview' && (
        <div className="space-y-4">
          {/* Question Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <p className="text-sm mb-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-lg font-medium">
              {questions[currentQuestionIndex]?.question}
            </p>
            <p className="text-sm mt-2 opacity-90">
              Type: {questions[currentQuestionIndex]?.type}
            </p>
          </div>
          
          {/* Video Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isRecording && answers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <div className="text-center">
                  <p className="text-white text-lg mb-2">Ready to start your interview</p>
                  <p className="text-gray-400 text-sm">Click "Start Interview" below</p>
                </div>
              </div>
            )}
            {isRecording && metrics?.no_face && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-md">
                ⚠️ No face detected
              </div>
            )}
          </div>

          {/* Real-time Metrics */}
          {metrics && !metrics.no_face && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Eye Contact</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.eye_contact * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Stability</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.head_stability * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Smile</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.smile * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            {!isRecording && answers.length === 0 && (
              <button
                onClick={startInterview}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md
                  hover:bg-green-700 transition-colors duration-200 font-semibold"
              >
                🎤 Start Interview
              </button>
            )}
            
            {isRecording && !isSaving && (
              <button
                onClick={finishQuestion}
                disabled={duration < 5}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md
                  hover:bg-blue-700 transition-colors duration-200 font-semibold
                  disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {duration < 5 ? `Answer for at least 5 seconds (${5 - duration}s)` : '✓ Next Question'}
              </button>
            )}
            
            {isSaving && (
              <div className="flex-1 bg-gray-400 text-white py-3 px-4 rounded-md text-center font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing answer...
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {answers.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ {answers.length} of {questions.length} questions answered
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 font-semibold mb-2">📌 Tips:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Look at the camera for eye contact</li>
              <li>Speak clearly and avoid filler words</li>
              <li>Answer for 30-60 seconds per question</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Results Step */}
      {step === 'results' && overallResults && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">🎉 Interview Complete!</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{overallResults.overall_score}</p>
                <p className="text-sm opacity-90">Overall Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{overallResults.technical_score}</p>
                <p className="text-sm opacity-90">Technical</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{overallResults.behavioral_score}</p>
                <p className="text-sm opacity-90">Behavioral</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Detailed Feedback</h4>
            {answers.map((answer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-2">Q{index + 1}: {answer.question}</p>
                <p className="text-sm text-gray-600 mb-2">Your answer: {answer.answer.substring(0, 150)}...</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    answer.score >= 80 ? 'bg-green-100 text-green-800' :
                    answer.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {answer.score}/100
                  </span>
                  <p className="text-sm text-gray-600">{answer.feedback}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
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
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
                transition-colors duration-200 font-semibold"
            >
              Start New Interview
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 
                transition-colors duration-200 font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveInterview
