import { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, Loader2 } from 'lucide-react'

/**
 * ReportUploader — drag-and-drop + file-picker upload.
 * Accepts any file and calls `onFile(file)` when chosen.
 * Backend handles file type validation and returns appropriate errors.
 */
export function ReportUploader({ onFile, busy }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const handle = (file) => {
    if (!file) return
    onFile(file)
  }

  return (
    <div
      className={`dropzone ${drag ? 'drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        handle(e.dataTransfer.files?.[0])
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => {
          handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {busy ? (
        <>
          <Loader2 className="upload-icon pulse" style={{ color: 'var(--brand-500)' }} />
          <h4>Analyzing report…</h4>
          <p>Extracting parameters, cross-checking ranges, generating insights</p>
        </>
      ) : (
        <>
          <UploadCloud className="upload-icon" />
          <h4>Drop your health report here</h4>
          <p>PDF, PNG or JPG — up to 10 MB. Reports are processed securely.</p>
          <span className="btn btn-soft btn-sm" style={{ marginTop: 14, pointerEvents: 'none' }}>
            <FileText /> Choose file
          </span>
        </>
      )}
    </div>
  )
}
