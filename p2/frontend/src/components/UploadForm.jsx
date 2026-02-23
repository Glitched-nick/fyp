import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/api'

function UploadForm() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid video file')
      setFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a video file')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const result = await uploadVideo(file, setProgress)
      navigate(`/results/${result.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-8 border border-surface-border">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Video File
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500/20 file:text-blue-400
              hover:file:bg-blue-500/30
              disabled:opacity-50
              bg-surface-elevated border border-surface-border rounded-md p-2"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-400">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {uploading && (
          <div>
            <div className="w-full bg-surface-elevated rounded-full h-2.5 border border-surface-border">
              <div
                className="bg-gradient-accent h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              {progress < 100 ? `Uploading... ${progress}%` : 'Processing video...'}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-gradient-accent text-white py-3 px-4 rounded-xl
            hover:shadow-xl disabled:bg-gray-600 disabled:cursor-not-allowed
            transition-all duration-200 font-semibold professional-glow"
        >
          {uploading ? 'Processing...' : 'Analyze Interview'}
        </button>
      </form>
    </div>
  )
}

export default UploadForm
