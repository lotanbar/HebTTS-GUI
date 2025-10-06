export enum FileStatus {
  LOADING = 'loading',
  READY = 'ready', 
  ERROR = 'error',
  PROCESSING = 'processing',
  SUCCESS = 'success'
}

export interface FileItem {
  id: string
  name: string
  originalFile: File
  content: string
  status: FileStatus
  error?: string
  isSelected: boolean
  jobId?: string
  audioUrl?: string
}

export interface FileContextType {
  files: FileItem[]
  selectedFiles: FileItem[]
  isSelectionMode: boolean
  showFileList: boolean
  allExpanded: boolean
  addFiles: (files: FileList) => Promise<void>
  removeFile: (id: string) => void
  stopFile: (id: string) => void
  removeAllFiles: () => void
  toggleFileSelection: (id: string) => void
  selectAllFiles: () => void
  clearSelection: () => void
  toggleExpandAll: () => void
  setSelectionMode: (mode: boolean) => void
  setShowFileList: (show: boolean) => void
  processFiles: (fileIds: string[]) => Promise<void>
  downloadFile: (id: string) => Promise<void>
  downloadAllSuccessful: () => Promise<void>
  downloadSelected: () => Promise<void>
}

export interface FileProviderProps {
  children: React.ReactNode
}

export interface FileValidationResult {
  isValid: boolean
  content?: string
  error?: string
}