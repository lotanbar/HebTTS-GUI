import { ConfigProvider, theme } from 'antd'
import { useState } from 'react'
import { useTTSForm } from './contexts/TTSFormContext'
import { TextInputCard } from './components/TextInputCard'
import { VoiceParametersCard } from './components/VoiceParametersCard'
import { GenerationCard } from './components/GenerationCard'
import { AudioPlayerCard } from './components/AudioPlayerCard'
import { Header } from './components/Header'
import { useAudioGeneration } from './hooks/useAudioGeneration'
import './App.css'

function App() {
  const ttsForm = useTTSForm()
  const { isGenerating, audioUrl, handleGenerate } = useAudioGeneration()

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Header />
          
          <TextInputCard 
            text={ttsForm.state.text}
            setText={ttsForm.setText}
          />
          
          <VoiceParametersCard
            speaker={ttsForm.state.speaker}
            setSpeaker={ttsForm.setSpeaker}
            useMbd={ttsForm.state.useMbd}
            setUseMbd={ttsForm.setUseMbd}
            topK={ttsForm.state.topK}
            setTopK={ttsForm.setTopK}
            temperature={ttsForm.state.temperature}
            setTemperature={ttsForm.setTemperature}
          />
          
          <GenerationCard
            text={ttsForm.state.text}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerate(ttsForm.getFormParams())}
          />

          {audioUrl && (
            <AudioPlayerCard audioUrl={audioUrl} />
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}

export default App
