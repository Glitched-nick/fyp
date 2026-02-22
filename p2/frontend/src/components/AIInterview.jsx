import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function AIInterview() {
  const [step, setStep] = useState('upload') // upload, interview, results
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overallResults, setOverallResults] = useState(null)
  
  // Form state
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Recording refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)
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
        setSessionId(response.data.session_id)
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      startTimeRef.current = Date.now()
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setIsRecording(false)
  }

  const submitAnswer = async () => {
    if (audioChunksRef.current.length === 0) {
      alert('Please record an answer first')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      const formData = new FormData()
      formData.append('session_id', sessionId)
      formData.append('question_index', currentQuestionIndex)
      formData.append('answer_audio', audioBlob, 'answer.webm')
      formData.append('answer_duration', recordingDuration)
      
      const response = await api.post('/ai-interview/submit-answer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        const newAnswer = {
          question: questions[currentQuestionIndex].question,
          answer_text: response.data.answer_text,
          analysis: response.data.analysis
        }
        
        setAnswers([...answers, newAnswer])
        
        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setRecordingDuration(0)
          audioChunksRef.current = []
        } else {
          // Complete interview
          await completeInterview()
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert(error.response?.data?.detail || 'Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeInterview = async () => {
    try {
      const formData = new FormData()
      formData.append('session_id', sessionId)
      
      const response = await api.post('/ai-interview/complete', formData)
      
      if (response.data.success) {
        setOverallResults(response.data.overall_results)
        setAnswers(response.data.detailed_answers)
        setStep('results')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      alert('Failed to complete interview')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">AI-Powered Interview</h2>
      
      {step === 'upload' && (
        <form onSubmit={handleStartInterview} className="space-y-6">
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
              <option value={10}>10 Questions</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
              transition-colors duration-200 font-semibold disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating Questions...' : 'Start AI Interview'}
          </button>
        </form>
      )}
      
      {step === 'interview' && questions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-lg font-medium text-gray-900">
              {questions[currentQuestionIndex].question}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Type: {questions[currentQuestionIndex].type}
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            {!isRecording && audioChunksRef.current.length === 0 && (
              <div>
                <p className="text-gray-600 mb-4">Click the button below to record your answer</p>
                <button
                  onClick={startRecording}
                  className="bg-red-600 text-white py-3 px-8 rounded-full hover:bg-red-700 
                    transition-colors duration-200 font-semibold"
                >
                  🎤 Start Recording
                </button>
              </div>
            )}
            
            {isRecording && (
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                  <p className="text-2xl font-mono font-bold">{formatTime(recordingDuration)}</p>
                </div>
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 text-white py-3 px-8 rounded-full hover:bg-gray-700 
                    transition-colors duration-200 font-semibold"
                >
                  ⏹ Stop Recording
                </button>
              </div>
            )}
            
            {!isRecording && audioChunksRef.current.length > 0 && (
              <div>
                <p className="text-green-600 mb-4">✓ Answer recorded ({formatTime(recordingDuration)})</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={submitAnswer}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 
                      transition-colors duration-200 font-semibold disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Analyzing...' : 'Submit Answer'}
                  </button>
                  <button
                    onClick={() => {
                      audioChunksRef.current = []
                      setRecordingDuration(0)
                    }}
                    disabled={isSubmitting}
                    className="bg-gray-300 text-gray-700 py-3 px-8 rounded-md hover:bg-gray-400 
                      transition-colors duration-200 font-semibold disabled:opacity-50"
                  >
                    Re-record
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {answers.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ {answers.length} answer(s) submitted
              </p>
            </div>
          )}
        </div>
      )}
      
      {step === 'results' && overallResults && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Interview Complete!</h3>
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
                <p className="text-sm text-gray-600 mb-2">Your answer: {answer.answer}</p>
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
                setStep('upload')
                setSessionId(null)
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

export default AIInterview
