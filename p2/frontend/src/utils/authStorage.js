const TOKEN_KEY = 'token'

export const getAuthToken = () => {
  const tokenInSession = sessionStorage.getItem(TOKEN_KEY)
  if (tokenInSession) {
    return tokenInSession
  }

  // Backward compatibility: migrate legacy localStorage token.
  const legacyToken = localStorage.getItem(TOKEN_KEY)
  if (legacyToken) {
    sessionStorage.setItem(TOKEN_KEY, legacyToken)
    localStorage.removeItem(TOKEN_KEY)
    return legacyToken
  }

  return null
}

export const setAuthToken = (token) => {
  if (!token) return
  sessionStorage.setItem(TOKEN_KEY, token)
  localStorage.removeItem(TOKEN_KEY)
}

export const clearAuthToken = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
