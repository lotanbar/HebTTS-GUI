import { useState } from 'react'
import { message } from 'antd'
import { synthesizeSpeech } from '../services/runpodAPI'
import { pollJobStatus } from '../services/jobPoller'
import { base64ToBlob } from '../utils/audio'

interface GenerateParams {
  text: string
  speaker: string
  use_mbd: boolean
  top_k: number
  temperature: number
}

export function useAudioGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const handleGenerate = async (params: GenerateParams) => {
    if (!params.text.trim()) {
      message.error('Please enter text to synthesize')
      return
    }

    setIsGenerating(true)
    setAudioUrl(null)
    
    try {
      console.log('Generating with params:', params)
      
      const response = await synthesizeSpeech({
        text: params.text,
        speaker: params.speaker,
        top_k: params.top_k,
        temperature: params.temperature,
        use_mbd: params.use_mbd
      })

      console.log('RunPod Response:', response)
      
      if (response.status === 'COMPLETED' && response.output?.audio_base64) {
        handleCompletedJob(response.output.audio_base64)
      } else if (response.status === 'FAILED') {
        handleFailedJob(response.output?.error)
      } else {
        startPolling(response.id)
      }
    } catch (error) {
      console.error('Generation error:', error)
      message.error('Failed to generate speech. Please check your connection and try again.')
      setIsGenerating(false)
    }
  }

  const handleCompletedJob = (audioBase64: string) => {
    const audioBlob = base64ToBlob(audioBase64, 'audio/wav')
    const url = URL.createObjectURL(audioBlob)
    setAudioUrl(url)
    message.success('Speech generated successfully!')
    setIsGenerating(false)
  }

  const handleFailedJob = (error?: string) => {
    message.error(`Generation failed: ${error || 'Unknown error'}`)
    setIsGenerating(false)
  }

  const startPolling = (jobId: string) => {
    message.info(`Job started - ID: ${jobId}`)
    console.log('Starting polling for job:', jobId)
    
    const subscription = pollJobStatus(jobId).subscribe({
      next: (status) => {
        console.log('Poll update:', status)
        
        if (status.status === 'COMPLETED' && status.output?.audio_base64) {
          handleCompletedJob(status.output.audio_base64)
          subscription.unsubscribe()
        } else if (status.status === 'FAILED') {
          handleFailedJob(status.output?.error)
          subscription.unsubscribe()
        }
      },
      error: (error) => {
        console.error('Polling error:', error)
        message.error('Error polling job status')
        setIsGenerating(false)
      }
    })
  }

  return {
    isGenerating,
    audioUrl,
    handleGenerate
  }
}
