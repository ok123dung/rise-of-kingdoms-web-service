# File Upload System with Cloudflare R2

## Overview

The application now includes a comprehensive file upload system using Cloudflare R2 for storage:

- Direct uploads and presigned URLs
- Image processing with Sharp
- Avatar management
- File organization by folders
- Public/private file support

## Setup

### 1. Cloudflare R2 Configuration

1. Create R2 bucket in Cloudflare dashboard
2. Generate API credentials
3. Configure environment variables:

```env
# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=rokservices-files
R2_PUBLIC_URL=https://your-bucket.r2.dev  # Optional public URL
```

### 2. Database Migration

Run migration to create FileUpload table:

```bash
npx prisma migrate dev
```

## Features

### File Upload Service

Located in `/src/lib/storage/upload-service.ts`:

- **Direct upload**: Upload files directly to R2
- **Image processing**: Resize, format conversion, thumbnail generation
- **Presigned URLs**: Secure uploads from client
- **File management**: List, delete, copy files

### API Endpoints

#### Upload File

```
POST /api/upload
Content-Type: multipart/form-data

file: File
folder: string (optional)
isPublic: boolean (optional)
```

#### Upload Image with Processing

```
POST /api/upload/image
Content-Type: multipart/form-data

file: File
folder: string (optional)
width: number (optional)
height: number (optional)
quality: number (optional)
generateThumbnail: boolean (optional)
```

#### Upload Avatar

```
POST /api/upload/avatar
Content-Type: multipart/form-data

file: File
```

#### Get Presigned Upload URL

```
GET /api/upload?filename=test.jpg&folder=images&mimeType=image/jpeg
```

#### List Files

```
GET /api/files?folder=images&limit=20&offset=0
```

#### Delete File

```
DELETE /api/files/[key]
```

## React Components

### FileUpload Component

```tsx
import { FileUpload } from '@/components/FileUpload'

;<FileUpload
  onUpload={file => console.log('Uploaded:', file)}
  onError={error => console.error(error)}
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  folder="images"
  isPublic={true}
/>
```

### AvatarUpload Component

```tsx
import { AvatarUpload } from '@/components/AvatarUpload'

;<AvatarUpload
  currentAvatarUrl={user.image}
  size="lg"
  onUploadComplete={url => console.log('New avatar:', url)}
/>
```

### FileList Component

```tsx
import { FileList } from '@/components/FileUpload'

;<FileList files={files} onDelete={key => handleDelete(key)} loading={loading} />
```

## Usage Examples

### Direct Upload from Client

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('folder', 'documents')
formData.append('isPublic', 'false')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const { file } = await response.json()
```

### Using Presigned URL

```typescript
// Get presigned URL
const response = await fetch('/api/upload?filename=test.pdf&folder=documents')
const { uploadUrl, key } = await response.json()

// Upload directly to R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
})
```

### Image Processing

```typescript
const formData = new FormData()
formData.append('file', imageFile)
formData.append('width', '800')
formData.append('height', '600')
formData.append('quality', '85')
formData.append('generateThumbnail', 'true')

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
})
```

## File Organization

Files are organized by folders:

- `avatars/` - User profile pictures
- `images/` - General images
- `documents/` - PDFs, docs, etc.
- `screenshots/` - Game screenshots
- `general/` - Other files

## Security

- File type validation
- File size limits
- User ownership verification
- Signed URLs for private files
- Automatic old avatar cleanup

## File Size Limits

- Avatar: 5MB
- Document: 10MB
- Image: 20MB
- Video: 100MB
- Default: 10MB

## Allowed File Types

- **Images**: JPEG, PNG, WebP, GIF
- **Documents**: PDF, DOC, DOCX
- **Videos**: MP4, WebM, MOV

## Best Practices

1. **Use appropriate folders** for organization
2. **Set isPublic=true** only for files that should be publicly accessible
3. **Use image processing** to optimize images before storage
4. **Generate thumbnails** for gallery displays
5. **Clean up old files** when replacing (like avatars)

## Troubleshooting

### Upload Fails

1. Check R2 credentials in .env
2. Verify file size is within limits
3. Check file type is allowed
4. Look for errors in server logs

### Images Not Displaying

1. Check if file is public or needs signed URL
2. Verify R2 public URL configuration
3. Check CORS settings in R2 bucket

### Processing Errors

1. Ensure Sharp dependencies are installed
2. Check image format is supported
3. Verify processing options are valid

## Cost Optimization

- Use image processing to reduce file sizes
- Set appropriate cache headers
- Clean up unused files regularly
- Use thumbnails for listings
- Consider CDN for public files
