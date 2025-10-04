import { ConfigProvider, theme, Input, Button, Card, Switch, Slider, Select, Typography, Space, Row, Col } from 'antd'
import { SoundOutlined, SettingOutlined } from '@ant-design/icons'
import { useTTSForm } from './contexts/TTSFormContext'
import './App.css'

const { TextArea } = Input
const { Title, Text } = Typography
const { Option } = Select

function App() {
  const { 
    state: { text, speaker, useMbd, topK, temperature },
    setText,
    setSpeaker,
    setUseMbd,
    setTopK,
    setTemperature,
    getFormParams
  } = useTTSForm()

  const speakers = [
    { value: 'osim', label: 'Osim' },
    { value: 'geek', label: 'Geek' },
    { value: 'shaul', label: 'Shaul' },
  ]

  const handleGenerate = () => {
    console.log('Generating with params:', getFormParams())
    // TODO: Implement API call to hebtts-backend
  }

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
          <div className="text-center mb-8">
            <Title level={1} className="text-white mb-2">
              <SoundOutlined className="mr-3" />
              HebTTS GUI
            </Title>
            <Text type="secondary" className="text-lg">
              Hebrew Text-to-Speech Generator
            </Text>
          </div>

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

          <Card className="bg-gray-800 border-gray-700">
            <div className="text-center">
              <Button
                type="primary"
                size="large"
                icon={<SoundOutlined />}
                onClick={handleGenerate}
                disabled={!text.trim()}
                className="px-8 py-6 h-auto text-lg font-medium"
              >
                Generate Speech
              </Button>
              
              {!text.trim() && (
                <div className="mt-3">
                  <Text type="secondary" className="text-sm">
                    Enter text above to enable generation
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default App
