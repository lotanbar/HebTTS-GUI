import { Card, Typography, Button, Collapse, Checkbox, Progress } from 'antd'
import { ArrowLeftOutlined, CloseOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, LoadingOutlined, CaretRightOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons'
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
  const { 
    files, 
    selectedFiles, 
    isSelectionMode, 
    toggleFileSelection, 
    selectAllFiles, 
    clearSelection, 
    setSelectionMode, 
    removeFile, 
    downloadFile,
    downloadAllSuccessful,
    downloadSelected 
  } = useFiles()

  const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS)
  const readyFiles = files.filter(f => f.status === FileStatus.READY)
  const allReadySelected = readyFiles.length > 0 && readyFiles.every(f => f.isSelected)
  const selectedSuccessfulFiles = selectedFiles.filter(f => f.status === FileStatus.SUCCESS)

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
            {isSelectionMode ? `${selectedFiles.length} Selected` : `Attached Files (${files.length})`}
          </Title>
        </div>
        <div className="flex items-center space-x-2">
          {readyFiles.length > 0 && !isSelectionMode && (
            <Button
              type="text"
              size="small"
              icon={<CheckSquareOutlined />}
              onClick={() => setSelectionMode(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              Select
            </Button>
          )}
          {isSelectionMode && (
            <>
              <Button
                type="text"
                size="small"
                icon={allReadySelected ? <BorderOutlined /> : <CheckSquareOutlined />}
                onClick={allReadySelected ? clearSelection : selectAllFiles}
                className="text-blue-400 hover:text-blue-300"
              >
                {allReadySelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedSuccessfulFiles.length > 0 && (
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={downloadSelected}
                  className="text-xs"
                >
                  Download Selected ({selectedSuccessfulFiles.length})
                </Button>
              )}
              <Button
                type="text"
                size="small"
                onClick={() => setSelectionMode(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </>
          )}
          {successfulFiles.length > 0 && !isSelectionMode && (
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={downloadAllSuccessful}
              className="text-xs"
            >
              Download All ({successfulFiles.length})
            </Button>
          )}
        </div>
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
                    percent={100}
                    size="small"
                    status="active"
                    showInfo={false}
                  />
                  <Text className="text-xs text-yellow-300 mt-1 block">
                    {file.jobId ? 'Processing on server...' : 'Submitting job...'}
                  </Text>
                </div>
              )}
              
              {file.status === FileStatus.LOADING && (
                <div className="mt-3">
                  <Progress
                    percent={100}
                    size="small"
                    status="active"
                    showInfo={false}
                  />
                  <Text className="text-xs text-blue-300 mt-1 block">
                    Reading and validating file...
                  </Text>
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
                    <div className="bg-red-900/20 border border-red-700 rounded p-2">
                      <Text className="text-red-300 text-xs font-medium block mb-1">
                        Error:
                      </Text>
                      <Text className="text-red-200 text-xs">
                        {file.error}
                      </Text>
                      <Text className="text-red-400 text-xs mt-2 block">
                        You can try removing and re-adding the file, or check if the file contains only Hebrew text.
                      </Text>
                    </div>
                  )}
                  {file.status === FileStatus.SUCCESS && file.audioUrl && (
                    <div className="bg-green-900/20 border border-green-700 rounded p-3">
                      <Text className="text-green-300 text-xs font-medium block mb-2">
                        ✓ Generation completed successfully
                      </Text>
                      <audio
                        controls
                        className="w-full h-8 mb-2"
                        src={file.audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <div className="flex justify-between items-center">
                        <Text className="text-green-400 text-xs">
                          Audio ready for download
                        </Text>
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
                    <div className="bg-green-900/10 border border-green-600 rounded p-2">
                      <Text className="text-green-300 text-xs">
                        ✓ File validation passed - Ready for speech generation
                      </Text>
                    </div>
                  )}
                  {file.status === FileStatus.LOADING && (
                    <div className="bg-blue-900/20 border border-blue-600 rounded p-2">
                      <Text className="text-blue-300 text-xs">
                        📖 Reading file content and validating Hebrew text...
                      </Text>
                    </div>
                  )}
                  {file.status === FileStatus.PROCESSING && (
                    <div className="bg-yellow-900/20 border border-yellow-600 rounded p-2">
                      <Text className="text-yellow-300 text-xs font-medium block mb-1">
                        🎵 Generating speech audio...
                      </Text>
                      <Text className="text-yellow-400 text-xs">
                        {file.jobId ? `Job ID: ${file.jobId}` : 'Submitting to server...'}
                      </Text>
                      <Text className="text-yellow-500 text-xs mt-1 block">
                        This may take a few minutes depending on text length
                      </Text>
                    </div>
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