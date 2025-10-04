#!/bin/bash

# Script to apply frontend refactor changes
# Run from your hebtts-gui directory

set -e  # Exit on any error

echo "🔧 Applying frontend refactor..."
echo ""

# Create directories if they don't exist
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/utils

echo "📁 Creating component files..."

# 1. Header component
cat > src/components/Header.tsx << 'EOF'
import { Typography } from 'antd'
import { SoundOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function Header() {
  return (
    <div className="text-center mb-8">
      <Title level={1} className="text-white mb-2">
        <SoundOutlined className="mr-3" />
        HebTTS GUI
      </Title>
      <Text type="secondary" className="text-lg">
        Hebrew Text-to-Speech Generator
      </Text>
    </div>
  )
}
EOF

# 2. TextInputCard component
cat > src/components/TextInputCard.tsx << 'EOF'
import { Card, Input, Typography } from 'antd'

const { TextArea } = Input
const { Title } = Typography

interface TextInputCardProps {
  text: string
  setText: (text: string) => void
}

export function TextInputCard({ text, setText }: TextInputCardProps) {
  return (
    <Card className="mb-6 bg-gray-800 border-gray-700">
      <Title level={3} className="text-white mb-4">
        Text Input
      </Title>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter Hebrew text to synthesize..."
        rows={4}
        className="mb-4"
        size="large"
      />
    </Card>
  )
}
EOF

# 3. VoiceParametersCard component
cat > src/components/VoiceParametersCard.tsx << 'EOF'
import { Card, Select, Switch, Slider, Typography, Space, Row, Col } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface VoiceParametersCardProps {
  speaker: string
  setSpeaker: (speaker: string) => void
  useMbd: boolean
  setUseMbd: (useMbd: boolean) => void
  topK: number
  setTopK: (topK: number) => void
  temperature: number
  setTemperature: (temperature: number) => void
}

const speakers = [
  { value: 'osim', label: 'Osim' },
  { value: 'geek', label: 'Geek' },
  { value: 'shaul', label: 'Shaul' },
]

export function VoiceParametersCard({
  speaker,
  setSpeaker,
  useMbd,
  setUseMbd,
  topK,
  setTopK,
  temperature,
  setTemperature
}: VoiceParametersCardProps) {
  return (
    <Card className="mb-6 bg-gray-800 border-gray-700">
      <Title level={3} className="text-white mb-4">
        <SettingOutlined className="mr-2" />
        Voice Parameters
      </Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" className="w-full">
            <Text className="text-white font-medium">Speaker</Text>
            <Select
              value={speaker}
              onChange={setSpeaker}
              className="w-full"
              size="large"
            >
              {speakers.map(s => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" className="w-full">
            <Text className="text-white font-medium">Multi-Band Diffusion</Text>
            <div className="flex items-center space-x-3">
              <Switch
                checked={useMbd}
                onChange={setUseMbd}
                size="default"
              />
              <Text type="secondary" className="text-sm">
                {useMbd ? 'Enabled (Higher Quality)' : 'Disabled'}
              </Text>
            </div>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" className="w-full">
            <Text className="text-white font-medium">Top K: {topK}</Text>
            <Slider
              min={1}
              max={50}
              value={topK}
              onChange={setTopK}
              tooltip={{ formatter: (value) => `${value}` }}
            />
            <Text type="secondary" className="text-xs">
              Lower values = more focused output
            </Text>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" className="w-full">
            <Text className="text-white font-medium">Temperature: {temperature}</Text>
            <Slider
              min={0.1}
              max={2.0}
              step={0.1}
              value={temperature}
              onChange={setTemperature}
              tooltip={{ formatter: (value) => `${value}` }}
            />
            <Text type="secondary" className="text-xs">
              Lower values = more deterministic
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  )
}
EOF

# 4. GenerationCard component
cat > src/components/GenerationCard.tsx << 'EOF'
import { Card, Button, Typography } from 'antd'
import { SoundOutlined, LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface GenerationCardProps {
  text: string
  isGenerating: boolean
  onGenerate: () => void
}

export function GenerationCard({ text, isGenerating, onGenerate }: GenerationCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <div className="text-center">
        <Button
          type="primary"
          size="large"
          icon={isGenerating ? <LoadingOutlined /> : <SoundOutlined />}
          onClick={onGenerate}
          disabled={!text.trim() || isGenerating}
          loading={isGenerating}
          className="px-8 py-6 h-auto text-lg font-medium"
        >
          {isGenerating ? 'Generating...' : 'Generate Speech'}
        </Button>
        
        {!text.trim() && !isGenerating && (
          <div className="mt-3">
            <Text type="secondary" className="text-sm">
              Enter text above to enable generation
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}
EOF

# 5. AudioPlayerCard component
cat > src/components/AudioPlayerCard.tsx << 'EOF'
import { Card, Button, Space } from 'antd'
import { PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import { useRef } from 'react'
import { downloadAudio } from '../utils/audio'

interface AudioPlayerCardProps {
  audioUrl: string
}

export function AudioPlayerCard({ audioUrl }: AudioPlayerCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const handleDownload = () => {
    downloadAudio(audioUrl, `hebtts_${Date.now()}.wav`)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="text-center">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          controls 
          className="w-full max-w-md mx-auto mb-4" 
        />
        <Space>
          <Button 
            icon={<PlayCircleOutlined />} 
            onClick={playAudio}
            size="large"
          >
            Play
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            size="large"
          >
            Download WAV
          </Button>
        </Space>
      </div>
    </Card>
  )
}
EOF

echo "🎣 Creating hook file..."

# 6. useAudioGeneration hook
cat > src/hooks/useAudioGeneration.ts << 'EOF'
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
EOF

echo "🛠️ Creating utils file..."

# 7. Audio utils
cat > src/utils/audio.ts << 'EOF'
export const base64ToBlob = (base64: string, contentType: string = ''): Blob => {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

export const downloadAudio = (audioUrl: string, filename: string = 'hebtts_output.wav') => {
  const a = document.createElement('a')
  a.href = audioUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
EOF

echo "📝 Updating App.tsx..."

# 8. Replace App.tsx
cat > src/App.tsx << 'EOF'
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
EOF

echo "🔧 Updating types..."

# 9. Update runpod types
cat > src/types/runpod.ts << 'EOF'
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
EOF

echo ""
echo "✅ Refactor applied successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run dev"
echo "2. Check the browser - everything should work"
echo "3. If you see TypeScript errors, restart your editor"
echo ""
echo "🔍 Files created/modified:"
echo "  - src/components/Header.tsx (NEW)"
echo "  - src/components/TextInputCard.tsx (NEW)"
echo "  - src/components/VoiceParametersCard.tsx (NEW)"
echo "  - src/components/GenerationCard.tsx (NEW)"
echo "  - src/components/AudioPlayerCard.tsx (NEW)"
echo "  - src/hooks/useAudioGeneration.ts (NEW)"
echo "  - src/utils/audio.ts (NEW)"
echo "  - src/App.tsx (REPLACED)"
echo "  - src/types/runpod.ts (UPDATED)"
echo ""