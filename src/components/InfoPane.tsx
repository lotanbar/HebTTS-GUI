import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined, GithubOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface InfoPaneProps {
  onClose: () => void
}

export function InfoPane({ onClose }: InfoPaneProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-y-scroll flex flex-col">
      <div className="flex items-center mb-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onClose}
          className="text-white hover:text-blue-400 mr-3"
          size="large"
        />
        <Title level={4} className="text-white mb-0">
          About This Project
        </Title>
      </div>

      <div className="space-y-4 text-white flex-1 overflow-y-auto pr-2">
        {/* Credits Section */}
        <div>
          <Title level={5} className="text-white mb-2">Credits</Title>
          <Text className="text-gray-300 text-sm">
            Built upon excellent work by Hebrew University researchers:
          </Text>
          <div className="mt-2 mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <GithubOutlined className="text-white text-sm" />
              <a 
                href="https://github.com/slp-rl/HebTTS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Original HebTTS Model
              </a>
            </div>
            <Text type="secondary" className="text-xs">
              Amit Roth, Arnon Turetzky, Yossi Adi
            </Text>
          </div>
        </div>

        {/* My Contributions */}
        <div>
          <Title level={5} className="text-white mb-2">My Contributions</Title>
          <Text className="text-gray-300 text-sm">
            Portable backend with chunking + this GUI:
          </Text>
          <div className="mt-2 space-y-1">
            <div className="flex items-center space-x-2">
              <GithubOutlined className="text-white text-sm" />
              <a 
                href="https://github.com/lotanbar/hebtts-gui-back" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Backend (chunking for long texts)
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <GithubOutlined className="text-white text-sm" />
              <a 
                href="https://github.com/lotanbar/hebtts-gui-front" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Frontend GUI
              </a>
            </div>
          </div>
        </div>

        {/* About the System */}
        <div>
          <Title level={5} className="text-white mb-2">About This System</Title>
          <Text className="text-gray-300 text-sm">
            Hebrew TTS using VALLE architecture with chunking for long texts. Works without diacritical marks.
          </Text>
          
          <div className="mt-3">
            <Text className="text-white text-sm font-medium">Voice Samples</Text>
            <div className="text-gray-300 text-sm mt-1">
              Add your voice: 2-4 second clean audio (24kHz, 16-bit WAV, no background noise).
            </div>
          </div>

          <div className="mt-3">
            <Text className="text-white text-sm font-medium">Usage</Text>
            <div className="text-gray-300 text-sm mt-1">
              • Input text or attach files (coming soon)<br/>
              • Select speaker & adjust parameters<br/>
              • Generate and download speech
            </div>
          </div>

          <div className="mt-3">
            <Text className="text-white text-sm font-medium">Parameters</Text>
            <div className="text-gray-300 text-sm mt-1">
              <strong>Multi-Band Diffusion:</strong> Uses diffusion model for cleaner audio (slower but higher fidelity)<br/>
              <strong>Top K:</strong> Limits vocabulary choices during generation (lower = more predictable words, higher = more diverse)<br/>
              <strong>Temperature:</strong> Controls speech variation (lower = robotic/consistent, higher = natural/expressive)
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}