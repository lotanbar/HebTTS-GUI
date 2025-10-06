import { Card, Select, Switch, Slider, Typography, Space, Row, Col } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { RestoreDefaultsButton } from './RestoreDefaultsButton'

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
    <Card className="bg-gray-800 border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <Title level={3} className="text-white mb-0">
          <SettingOutlined className="mr-2" />
          Voice Parameters
        </Title>
        <RestoreDefaultsButton />
      </div>
      
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
