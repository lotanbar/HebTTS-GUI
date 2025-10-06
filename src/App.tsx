import { ConfigProvider, theme } from 'antd'
import { useState, useEffect } from 'react'
import { useTTSForm } from './contexts/TTSFormContext'
import { useFiles } from './contexts/FileContext'
import { TextInputCard } from './components/TextInputCard'
import { VoiceParametersCard } from './components/VoiceParametersCard'
import { GenerationCard } from './components/GenerationCard'
import { AudioPlayerCard } from './components/AudioPlayerCard'
import { Header } from './components/Header'
import { InfoPane } from './components/InfoPane'
import { FileListPane } from './components/FileListPane'
import { useAudioGeneration } from './hooks/useAudioGeneration'
import './App.css'

function App() {
  const ttsForm = useTTSForm()
  const { showFileList, setShowFileList } = useFiles()
  const { isGenerating, audioUrl, handleGenerate, handleStop } = useAudioGeneration()
  const [showInfoPane, setShowInfoPane] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const showSidePane = showInfoPane || (showFileList && !isMobile)

  const handleToggleFileList = (show: boolean) => {
    setShowFileList(show)
    if (show && showInfoPane) {
      setShowInfoPane(false)
    }
  }

  const handleToggleInfoPane = () => {
    setShowInfoPane(!showInfoPane)
    if (!showInfoPane && showFileList) {
      setShowFileList(false)
    }
  }

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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
      <div className="bg-gray-900 p-6 overflow-hidden" style={{ height: '100vh' }}>
        <div className="flex" style={{ height: 'calc(100vh - 3rem)' }}>
          {/* Main Content */}
          <div className={`${
            isMobile 
              ? showInfoPane ? 'hidden' : 'w-full' 
              : (showInfoPane || (showFileList && !isMobile)) ? 'w-1/2 pr-3' : 'w-full max-w-4xl mx-auto'
          } flex flex-col`}>
            <Header onInfoClick={handleToggleInfoPane} />
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
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
                  onStop={handleStop}
                  onToggleFileList={handleToggleFileList}
                />

                {audioUrl && (
                  <AudioPlayerCard audioUrl={audioUrl} />
                )}

                {/* Mobile File List Below Main Content */}
                {isMobile && showFileList && (
                  <FileListPane 
                    onClose={() => setShowFileList(false)} 
                    isMobile={true}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Side Pane (Desktop Only) */}
          {showSidePane && (
            <div className="w-1/2 pl-3 overflow-hidden">
              <div className="h-full">
                {showFileList && !isMobile ? (
                  <FileListPane 
                    onClose={() => setShowFileList(false)} 
                    isMobile={false}
                  />
                ) : showInfoPane ? (
                  <InfoPane onClose={() => setShowInfoPane(false)} />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}

export default App
