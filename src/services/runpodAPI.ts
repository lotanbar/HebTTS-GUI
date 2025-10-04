import type { RunPodRequest, RunPodResponse } from '../types/runpod'

const getConfig = () => {
  const apiKey = import.meta.env.VITE_RUNPOD_API_KEY
  const endpointUrl = import.meta.env.VITE_RUNPOD_API_URL
  
  if (!apiKey || !endpointUrl) {
    throw new Error('RunPod API configuration missing. Check your .env file.')
  }
  
  return { apiKey, endpointUrl }
}

export const synthesizeSpeech = async (params: RunPodRequest): Promise<RunPodResponse> => {
  const { apiKey, endpointUrl } = getConfig()
  
  const requestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: {
        text: params.text,
        speaker: params.speaker,
        top_k: params.top_k,
        temperature: params.temperature,
        use_mbd: params.use_mbd,
        filename: params.filename || 'output'
      }
    })
  }

  const response = await fetch(endpointUrl, requestConfig)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const getJobStatus = async (jobId: string): Promise<RunPodResponse> => {
  const { apiKey, endpointUrl } = getConfig()
  const statusUrl = endpointUrl.replace('/run', `/status/${jobId}`)
  
  const response = await fetch(statusUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const cancelJob = async (jobId: string): Promise<void> => {
  const { apiKey, endpointUrl } = getConfig()
  const cancelUrl = endpointUrl.replace('/run', `/cancel/${jobId}`)
  
  const response = await fetch(cancelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

export const checkHealth = async (): Promise<{ status: string }> => {
  const { apiKey, endpointUrl } = getConfig()
  const healthUrl = endpointUrl.replace('/run', '/health')
  
  const response = await fetch(healthUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}