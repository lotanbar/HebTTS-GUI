export interface RunPodRequest {
  text: string
  speaker: string
  top_k: number
  temperature: number
  use_mbd: boolean
  filename?: string
}

export interface RunPodResponse {
  id: string
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  output?: {
    audio_base64?: string
    filename?: string
    sample_rate?: number
    format?: string
    error?: string
  }
}
