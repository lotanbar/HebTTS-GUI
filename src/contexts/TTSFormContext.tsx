import React, { createContext, useContext, useState, useEffect } from 'react'
import type { TTSFormContextType, TTSFormProviderProps } from '../types/tts'
import { loadPersistedState, saveToStorage, saveFullState } from '../utils/storage'

const DEFAULT_VALUES = {
  text: '',
  speaker: 'osim',
  useMbd: true,
  topK: 50,
  temperature: 1.0,
}

const TTSFormContext = createContext<TTSFormContextType | undefined>(undefined)

export function TTSFormProvider({ children }: TTSFormProviderProps) {
  const [text, setText] = useState(DEFAULT_VALUES.text)
  const [speaker, setSpeaker] = useState(DEFAULT_VALUES.speaker)
  const [useMbd, setUseMbd] = useState(DEFAULT_VALUES.useMbd)
  const [topK, setTopK] = useState(DEFAULT_VALUES.topK)
  const [temperature, setTemperature] = useState(DEFAULT_VALUES.temperature)

  useEffect(() => {
    loadPersistedState().then((persistedState) => {
      if (persistedState.speaker) setSpeaker(persistedState.speaker)
      if (persistedState.useMbd !== undefined) setUseMbd(persistedState.useMbd)
      if (persistedState.topK) setTopK(persistedState.topK)
      if (persistedState.temperature) setTemperature(persistedState.temperature)
    })
  }, [])

  const handleSetSpeaker = (newSpeaker: string) => {
    setSpeaker(newSpeaker)
    saveToStorage('speaker', newSpeaker)
  }

  const handleSetUseMbd = (newUseMbd: boolean) => {
    setUseMbd(newUseMbd)
    saveToStorage('useMbd', newUseMbd)
  }

  const handleSetTopK = (newTopK: number) => {
    setTopK(newTopK)
    saveToStorage('topK', newTopK)
  }

  const handleSetTemperature = (newTemperature: number) => {
    setTemperature(newTemperature)
    saveToStorage('temperature', newTemperature)
  }

  const resetToDefaults = () => {
    setSpeaker(DEFAULT_VALUES.speaker)
    setUseMbd(DEFAULT_VALUES.useMbd)
    setTopK(DEFAULT_VALUES.topK)
    setTemperature(DEFAULT_VALUES.temperature)
    
    saveFullState({
      speaker: DEFAULT_VALUES.speaker,
      useMbd: DEFAULT_VALUES.useMbd,
      topK: DEFAULT_VALUES.topK,
      temperature: DEFAULT_VALUES.temperature,
    })
  }

  const getFormParams = () => ({
    text,
    speaker,
    use_mbd: useMbd,
    top_k: topK,
    temperature,
  })

  const state = { text, speaker, useMbd, topK, temperature }

  const contextValue: TTSFormContextType = {
    state,
    setText,
    setSpeaker: handleSetSpeaker,
    setUseMbd: handleSetUseMbd,
    setTopK: handleSetTopK,
    setTemperature: handleSetTemperature,
    resetToDefaults,
    getFormParams,
  }

  return (
    <TTSFormContext.Provider value={contextValue}>
      {children}
    </TTSFormContext.Provider>
  )
}

export function useTTSForm(): TTSFormContextType {
  const context = useContext(TTSFormContext)
  if (!context) {
    throw new Error('useTTSForm must be used within a TTSFormProvider')
  }
  return context
}