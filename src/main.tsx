import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TTSFormProvider } from './contexts/TTSFormContext'
import { FileProvider } from './contexts/FileContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FileProvider>
      <TTSFormProvider>
        <App />
      </TTSFormProvider>
    </FileProvider>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
