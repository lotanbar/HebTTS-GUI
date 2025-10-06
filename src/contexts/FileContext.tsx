import React, { createContext, useContext, useState, useCallback } from 'react'
import type { FileContextType, FileProviderProps, FileItem } from '../types/file'
import { FileStatus } from '../types/file'
import { validateHebrewText, readFileAsText } from '../utils/hebrewValidation'
import { synthesizeSpeech, getJobStatus } from '../services/runpodAPI'
import { useTTSForm } from './TTSFormContext'

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: FileProviderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showFileList, setShowFileList] = useState(false)
  const { getFormParams } = useTTSForm()

  const selectedFiles = files.filter(file => file.isSelected)

  const generateUniqueId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileItem[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileItem: FileItem = {
        id: generateUniqueId(),
        name: file.name,
        originalFile: file,
        content: '',
        status: FileStatus.LOADING,
        isSelected: false
      }
      newFiles.push(fileItem)
    }

    setFiles(prev => [...prev, ...newFiles])
    setShowFileList(true)

    for (const fileItem of newFiles) {
      try {
        const textContent = await readFileAsText(fileItem.originalFile)
        const validation = validateHebrewText(textContent)
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? {
                ...f,
                content: validation.content || '',
                status: validation.isValid ? FileStatus.READY : FileStatus.ERROR,
                error: validation.error
              }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? {
                ...f,
                status: FileStatus.ERROR,
                error: error instanceof Error ? error.message : 'Failed to read file'
              }
            : f
        ))
      }
    }
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const toggleFileSelection = useCallback((id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id && f.status === FileStatus.READY 
        ? { ...f, isSelected: !f.isSelected } 
        : f
    ))
  }, [])

  const selectAllFiles = useCallback(() => {
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      isSelected: f.status === FileStatus.READY ? true : f.isSelected 
    })))
  }, [])

  const clearSelection = useCallback(() => {
    setFiles(prev => prev.map(f => ({ 
      ...f, 
      isSelected: f.status === FileStatus.READY ? false : f.isSelected 
    })))
  }, [])

  const processFiles = useCallback(async (fileIds: string[]) => {
    const filesToProcess = files.filter(f => fileIds.includes(f.id) && f.status === FileStatus.READY)
    const formParams = getFormParams()
    
    setFiles(prev => prev.map(f => 
      fileIds.includes(f.id) && f.status === FileStatus.READY
        ? { ...f, status: FileStatus.PROCESSING }
        : f
    ))

    const processPromises = filesToProcess.map(async (file) => {
      try {
        const response = await synthesizeSpeech({
          text: file.content,
          speaker: formParams.speaker,
          top_k: formParams.top_k,
          temperature: formParams.temperature,
          use_mbd: formParams.use_mbd,
          filename: file.name.replace('.txt', '')
        })

        if (response.id) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, jobId: response.id } : f
          ))

          let jobComplete = false
          while (!jobComplete) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            const statusResponse = await getJobStatus(response.id)
            
            if (statusResponse.status === 'COMPLETED') {
              setFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { 
                      ...f, 
                      status: FileStatus.SUCCESS,
                      audioUrl: statusResponse.output?.audio_url 
                    }
                  : f
              ))
              jobComplete = true
            } else if (statusResponse.status === 'FAILED') {
              setFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { 
                      ...f, 
                      status: FileStatus.ERROR,
                      error: statusResponse.error || 'Generation failed'
                    }
                  : f
              ))
              jobComplete = true
            }
          }
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                status: FileStatus.ERROR,
                error: error instanceof Error ? error.message : 'Processing failed'
              }
            : f
        ))
      }
    })

    await Promise.allSettled(processPromises)
  }, [files, getFormParams])

  const downloadFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id)
    if (file?.audioUrl) {
      const link = document.createElement('a')
      link.href = file.audioUrl
      link.download = `${file.name.replace('.txt', '')}.wav`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [files])

  const downloadAllSuccessful = useCallback(() => {
    const successfulFiles = files.filter(f => f.status === FileStatus.SUCCESS && f.audioUrl)
    successfulFiles.forEach(file => downloadFile(file.id))
  }, [files, downloadFile])

  const contextValue: FileContextType = {
    files,
    selectedFiles,
    isSelectionMode,
    showFileList,
    addFiles,
    removeFile,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setSelectionMode: setIsSelectionMode,
    setShowFileList,
    processFiles,
    downloadFile,
    downloadAllSuccessful
  }

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  )
}

export function useFiles(): FileContextType {
  const context = useContext(FileContext)
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider')
  }
  return context
}