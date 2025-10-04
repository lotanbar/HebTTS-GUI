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
