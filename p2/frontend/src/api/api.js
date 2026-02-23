import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Video Upload API
export const uploadVideo = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      if (onProgress) onProgress(percentCompleted)
    },
  })
  
  return response.data
}

export const getResults = async (id) => {
  const response = await api.get(`/results/${id}`)
  return response.data
}

export const getHistory = async (limit = 10) => {
  const response = await api.get(`/history?limit=${limit}`)
  return response.data
}

export const deleteInterview = async (id) => {
  const response = await api.delete(`/results/${id}`)
  return response.data
}

// AI Interview API
export const startAIInterview = async (resume, jobDescription, numQuestions) => {
  const formData = new FormData()
  formData.append('resume', resume)
  formData.append('job_description', jobDescription)
  formData.append('num_questions', numQuestions)
  
  const response = await api.post('/ai-interview/start', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

export const submitAnswer = async (sessionId, questionIndex, answerAudio, answerText, answerDuration) => {
  const formData = new FormData()
  formData.append('session_id', sessionId)
  formData.append('question_index', questionIndex)
  formData.append('answer_duration', answerDuration)
  
  if (answerAudio) {
    formData.append('answer_audio', answerAudio, 'answer.webm')
  }
  if (answerText) {
    formData.append('answer_text', answerText)
  }
  
  const response = await api.post('/ai-interview/submit-answer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

export const completeInterview = async (sessionId) => {
  const response = await api.post('/ai-interview/complete', {
    session_id: sessionId
  })
  
  return response.data
}

export const getAISession = async (sessionId) => {
  const response = await api.get(`/ai-interview/session/${sessionId}`)
  return response.data
}

export const getAIInterviewHistory = async () => {
  const response = await api.get('/ai-interview/history')
  return response.data
}

export default api
