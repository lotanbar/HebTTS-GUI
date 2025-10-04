export interface TTSFormState {
  text: string
  speaker: string
  useMbd: boolean
  topK: number
  temperature: number
}

export type TTSFormAction =
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_SPEAKER'; payload: string }
  | { type: 'SET_USE_MBD'; payload: boolean }
  | { type: 'SET_TOP_K'; payload: number }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<TTSFormState> }

export interface TTSFormContextType {
  state: TTSFormState
  setText: (text: string) => void
  setSpeaker: (speaker: string) => void
  setUseMbd: (useMbd: boolean) => void
  setTopK: (topK: number) => void
  setTemperature: (temperature: number) => void
  resetToDefaults: () => void
  getFormParams: () => {
    text: string
    speaker: string
    use_mbd: boolean
    top_k: number
    temperature: number
  }
}

export interface TTSFormProviderProps {
  children: React.ReactNode
}

export interface Speaker {
  value: string
  label: string
}

export interface ElectronAPI {
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}