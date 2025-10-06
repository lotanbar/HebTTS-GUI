import { Card, Typography, Button, Collapse, Checkbox, Progress } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, LoadingOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useFiles } from '../contexts/FileContext'
import { FileStatus } from '../types/file'

const { Title, Text } = Typography
const { Panel } = Collapse

interface FileListPaneProps {
  onClose: () => void
  isMobile: boolean
}

const getStatusIcon = (status: FileStatus) => {
  switch (status) {
    case FileStatus.LOADING:
      return <LoadingOutlined className="text-blue-400 animate-spin" />
    case FileStatus.READY:
      return <CheckCircleOutlined className="text-green-400" />
    case FileStatus.ERROR:
      return <ExclamationCircleOutlined className="text-red-400" />
    case FileStatus.PROCESSING:
      return <LoadingOutlined className="text-yellow-400 animate-spin" />
    case FileStatus.SUCCESS:
      return <CheckCircleOutlined className="text-green-500" />
    default:
      return <FileTextOutlined className="text-gray-400" />
  }
}

const getStatusText = (status: FileStatus) => {
  switch (status) {
    case FileStatus.LOADING:
      return 'Loading...'
    case FileStatus.READY:
      return 'Ready'
    case FileStatus.ERROR:
      return 'Error'
    case FileStatus.PROCESSING:
      return 'Processing...'
    case FileStatus.SUCCESS:
      return 'Complete'
    default:
      return 'Unknown'
  }
}

export function FileListPane({ onClose, isMobile }: FileListPaneProps) {
  const { files, isSelectionMode, toggleFileSelection, removeFile, downloadFile } = useFiles()

  const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS)

  return (
    <Card className="bg-gray-800 border-gray-700 h-full overflow-y-scroll flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            type="text"
            icon={isMobile ? <CloseOutlined /> : <ArrowLeftOutlined />}
            onClick={onClose}
            className="text-white hover:text-blue-400 mr-3"
            size="large"
          />
          <Title level={4} className="text-white mb-0">
            Attached Files ({files.length})
          </Title>
        </div>
        {successfulFiles.length > 0 && (
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            className="text-xs"
          >
            Download All
          </Button>
        )}
      </div>

      <div className="space-y-2 text-white flex-1 overflow-y-auto pr-2">
        {files.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FileTextOutlined className="text-4xl mb-3" />
            <Text className="text-gray-400">No files attached yet</Text>
          </div>
        ) : (
          files.map((file) => (
            <Card
              key={file.id}
              size="small"
              className="bg-gray-700 border-gray-600 hover:border-gray-500 transition-colors"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {isSelectionMode && file.status === FileStatus.READY && (
                    <Checkbox
                      checked={file.isSelected}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  )}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-lg">
                      {getStatusIcon(file.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="text-white text-sm font-medium truncate block" title={file.name}>
                        {file.name}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {getStatusText(file.status)}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === FileStatus.SUCCESS && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadFile(file.id)}
                      className="text-blue-400 hover:text-blue-300"
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300 text-lg font-bold"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {file.status === FileStatus.PROCESSING && (
                <div className="mt-3">
                  <Progress
                    percent={75}
                    size="small"
                    status="active"
                    showInfo={false}
                  />
                </div>
              )}

              <Collapse
                ghost
                size="small"
                className="mt-3"
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined 
                    rotate={isActive ? 90 : 0} 
                    className="text-gray-400"
                  />
                )}
              >
                <Panel
                  header={
                    <Text className="text-xs text-gray-400">
                      {file.error ? 'Error Details' : 
                       file.status === FileStatus.SUCCESS ? 'Audio Preview' :
                       file.status === FileStatus.LOADING ? 'Loading...' :
                       file.status === FileStatus.PROCESSING ? 'Processing...' :
                       'Details'}
                    </Text>
                  }
                  key="1"
                  className="text-xs"
                >
                  {file.error && (
                    <Text className="text-red-300 text-xs">
                      {file.error}
                    </Text>
                  )}
                  {file.status === FileStatus.SUCCESS && file.audioUrl && (
                    <div className="space-y-2">
                      <audio
                        controls
                        className="w-full h-8"
                        src={file.audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <div className="flex justify-end">
                        <Button
                          type="link"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadFile(file.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs p-0"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  {file.status === FileStatus.READY && (
                    <Text className="text-green-300 text-xs">
                      File is ready for processing
                    </Text>
                  )}
                  {file.status === FileStatus.LOADING && (
                    <Text className="text-blue-300 text-xs">
                      Reading and validating file content...
                    </Text>
                  )}
                  {file.status === FileStatus.PROCESSING && (
                    <Text className="text-yellow-300 text-xs">
                      Generating speech audio...
                    </Text>
                  )}
                </Panel>
              </Collapse>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}