/**
 * FileUpload Component Tests
 * Tests file upload, drag-drop, validation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { FileUpload, FileList } from '../FileUpload'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render upload button', () => {
      render(<FileUpload onUpload={jest.fn()} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should display upload instructions', () => {
      render(<FileUpload onUpload={jest.fn()} />)

      expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument()
    })

    it('should display max file size', () => {
      render(<FileUpload onUpload={jest.fn()} maxSize={5 * 1024 * 1024} />)

      expect(screen.getByText(/Maximum file size: 5.0 MB/)).toBeInTheDocument()
    })

    it('should render hidden file input', () => {
      render(<FileUpload onUpload={jest.fn()} />)

      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('hidden')
    })

    it('should pass accept prop to input', () => {
      render(<FileUpload onUpload={jest.fn()} accept="image/*" />)

      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('Custom children', () => {
    it('should render custom children when provided', () => {
      render(
        <FileUpload onUpload={jest.fn()}>
          <span data-testid="custom-trigger">Custom Upload Button</span>
        </FileUpload>
      )

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
    })

    it('should not render default UI when children provided', () => {
      render(
        <FileUpload onUpload={jest.fn()}>
          <span>Custom</span>
        </FileUpload>
      )

      expect(screen.queryByText('Click to upload or drag and drop')).not.toBeInTheDocument()
    })
  })

  describe('File validation', () => {
    it('should reject files exceeding max size', async () => {
      const onError = jest.fn()
      render(<FileUpload onUpload={jest.fn()} onError={onError} maxSize={1024} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const largeFile = new File(['x'.repeat(2048)], 'large.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [largeFile] } })

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('File size must be less than 1.0 KB')
      })
    })

    it('should accept files within size limit', async () => {
      const onUpload = jest.fn()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            file: { key: 'test-key', url: 'http://example.com/file', size: 100, mime_type: 'text/plain' }
          })
      })

      render(<FileUpload onUpload={onUpload} maxSize={1024 * 1024} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const validFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.any(Object))
      })
    })
  })

  describe('Upload process', () => {
    it('should call API with correct FormData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            file: { key: 'key', url: 'url', size: 100, mime_type: 'text/plain' }
          })
      })

      render(<FileUpload onUpload={jest.fn()} folder="documents" is_public={true} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        const [url, options] = mockFetch.mock.calls[0]
        expect(url).toBe('/api/upload')
        expect(options.method).toBe('POST')
        expect(options.body).toBeInstanceOf(FormData)
      })
    })

    it('should call onUpload with file data on success', async () => {
      const onUpload = jest.fn()
      const fileData = {
        key: 'uploaded-key',
        url: 'http://example.com/uploaded',
        size: 500,
        mime_type: 'image/png'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ file: fileData })
      })

      render(<FileUpload onUpload={onUpload} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['test'], 'image.png', { type: 'image/png' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith({
          ...fileData,
          filename: 'image.png'
        })
      })
    })

    it('should call onError on upload failure', async () => {
      const onError = jest.fn()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      })

      render(<FileUpload onUpload={jest.fn()} onError={onError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Upload failed')
      })
    })

    it('should handle network errors', async () => {
      const onError = jest.fn()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<FileUpload onUpload={jest.fn()} onError={onError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error')
      })
    })
  })

  describe('Drag and drop', () => {
    it('should show drag active state on dragenter', () => {
      render(<FileUpload onUpload={jest.fn()} />)

      const dropZone = screen.getByRole('button')
      fireEvent.dragEnter(dropZone)

      expect(dropZone).toHaveClass('border-blue-500')
    })

    it('should remove drag active state on dragleave', () => {
      render(<FileUpload onUpload={jest.fn()} />)

      const dropZone = screen.getByRole('button')
      fireEvent.dragEnter(dropZone)
      fireEvent.dragLeave(dropZone)

      expect(dropZone).toHaveClass('border-gray-300')
    })

    it('should handle file drop', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            file: { key: 'key', url: 'url', size: 100, mime_type: 'text/plain' }
          })
      })

      render(<FileUpload onUpload={jest.fn()} />)

      const dropZone = screen.getByRole('button').parentElement!
      const file = new File(['test'], 'dropped.txt', { type: 'text/plain' })

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] }
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })

  describe('Upload progress', () => {
    it('should show loading state during upload', async () => {
      let resolveUpload: (value: unknown) => void
      const uploadPromise = new Promise(resolve => {
        resolveUpload = resolve
      })

      mockFetch.mockReturnValueOnce(uploadPromise)

      render(<FileUpload onUpload={jest.fn()} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Uploading/)).toBeInTheDocument()
      })

      // Cleanup
      resolveUpload!({
        ok: true,
        json: () => Promise.resolve({ file: { key: 'k', url: 'u', size: 1, mime_type: 't' } })
      })
    })
  })
})

describe('FileList Component', () => {
  const mockFiles = [
    {
      id: '1',
      key: 'file-1',
      filename: 'document.pdf',
      size: 1024 * 500,
      mime_type: 'application/pdf',
      url: 'http://example.com/doc.pdf',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      key: 'file-2',
      filename: 'image.png',
      size: 1024 * 1024 * 2,
      mime_type: 'image/png',
      url: 'http://example.com/img.png',
      created_at: '2024-01-16T10:00:00Z'
    }
  ]

  describe('Rendering', () => {
    it('should render list of files', () => {
      render(<FileList files={mockFiles} />)

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('image.png')).toBeInTheDocument()
    })

    it('should display file sizes', () => {
      render(<FileList files={mockFiles} />)

      expect(screen.getByText(/500.0 KB/)).toBeInTheDocument()
      expect(screen.getByText(/2.0 MB/)).toBeInTheDocument()
    })

    it('should display file dates', () => {
      render(<FileList files={mockFiles} />)

      // Check date is displayed (format may vary by locale)
      expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0)
    })

    it('should have View links', () => {
      render(<FileList files={mockFiles} />)

      const viewLinks = screen.getAllByRole('link', { name: 'View' })
      expect(viewLinks).toHaveLength(2)
      expect(viewLinks[0]).toHaveAttribute('href', 'http://example.com/doc.pdf')
      expect(viewLinks[0]).toHaveAttribute('target', '_blank')
    })
  })

  describe('Empty state', () => {
    it('should show empty message when no files', () => {
      render(<FileList files={[]} />)

      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('should show loading spinner when loading', () => {
      render(<FileList files={[]} loading={true} />)

      // Check for spinner presence (animate-spin class)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show files when loading', () => {
      render(<FileList files={mockFiles} loading={true} />)

      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument()
    })
  })

  describe('Delete functionality', () => {
    it('should show delete button when onDelete provided', () => {
      render(<FileList files={mockFiles} onDelete={jest.fn()} />)

      const deleteButtons = screen.getAllByRole('button')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })

    it('should not show delete button when onDelete not provided', () => {
      render(<FileList files={mockFiles} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should call onDelete with file key when delete clicked', () => {
      const onDelete = jest.fn()
      render(<FileList files={mockFiles} onDelete={onDelete} />)

      const deleteButtons = screen.getAllByRole('button')
      fireEvent.click(deleteButtons[0])

      expect(onDelete).toHaveBeenCalledWith('file-1')
    })
  })
})
