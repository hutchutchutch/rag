# Google Drive Integration Guide

This document outlines how to integrate Google Drive with your application for importing documents into your RAG application.

## Setup Google API Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API for your project
   - In the left sidebar, click on "APIs & Services" > "Library"
   - Search for "Google Drive API" and enable it

## Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Set a name for your OAuth client
5. Add authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For production: `https://your-app-domain.com`
6. Add authorized redirect URIs:
   - For development: `http://localhost:5173/auth/google/callback`
   - For production: `https://your-app-domain.com/auth/google/callback`
7. Click "Create" and note down your Client ID and Client Secret

## Backend Implementation

### Install Required Packages

```bash
npm install googleapis @types/gaxios
```

### Configure Google Drive API Client

```typescript
// apps/backend/src/config/google-drive.ts
import { google } from 'googleapis';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

export const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const createDriveClient = (oAuthClient: any) => {
  return google.drive({
    version: 'v3',
    auth: oAuthClient
  });
};
```

### Implement Auth Routes

```typescript
// apps/backend/src/routes/google-auth.ts
import { Router } from 'express';
import { createOAuthClient, SCOPES } from '../config/google-drive';

const router = Router();

router.get('/auth/google', (req, res) => {
  const oauth2Client = createOAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Forces refresh token
  });
  
  res.redirect(authUrl);
});

router.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  const oauth2Client = createOAuthClient();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Store tokens in user session or database
    req.session.tokens = tokens;
    
    res.redirect('/');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
```

### Implement File Listing and Download

```typescript
// apps/backend/src/services/drive-service.ts
import { drive_v3 } from 'googleapis';
import { createOAuthClient, createDriveClient } from '../config/google-drive';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET_NAME } from '../config/s3';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

export class DriveService {
  private driveClient: drive_v3.Drive;
  
  constructor(tokens: any) {
    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(tokens);
    this.driveClient = createDriveClient(oauth2Client);
  }
  
  /**
   * List files from user's Google Drive
   */
  async listFiles(query = "mimeType='application/pdf' or mimeType='text/plain'") {
    try {
      const response = await this.driveClient.files.list({
        q: query,
        fields: 'files(id, name, mimeType, webViewLink, createdTime)',
        orderBy: 'createdTime desc'
      });
      
      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
  
  /**
   * Download a file from Google Drive and upload to S3
   */
  async downloadFileToS3(fileId: string, fileName: string) {
    try {
      // Download file from Google Drive
      const response = await this.driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      
      // Create a temp file to store the download
      const tempPath = path.join('/tmp', fileName);
      const writer = fs.createWriteStream(tempPath);
      
      return new Promise<string>((resolve, reject) => {
        response.data
          .on('end', async () => {
            // Upload to S3
            try {
              const fileContent = fs.readFileSync(tempPath);
              const s3Key = `documents/${Date.now()}-${fileName}`;
              
              await s3Client.send(new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: response.headers['content-type']
              }));
              
              // Clean up temp file
              fs.unlinkSync(tempPath);
              
              resolve(s3Key);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            // Clean up temp file if exists
            if (fs.existsSync(tempPath)) {
              fs.unlinkSync(tempPath);
            }
            reject(error);
          })
          .pipe(writer);
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export default DriveService;
```

## Frontend Implementation

### Google Drive File Picker Component

```tsx
// apps/frontend/src/components/GoogleDrivePicker.tsx
import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'your-ui-library';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
}

const GoogleDrivePicker: React.FC = () => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  
  // Fetch files from Google Drive
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/google-drive/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Error fetching files: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // Import selected files
  const importFiles = async () => {
    if (selectedFileIds.length === 0) return;
    
    setImporting(true);
    
    try {
      const response = await fetch('/api/google-drive/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileIds: selectedFileIds })
      });
      
      if (!response.ok) throw new Error('Failed to import files');
      
      const result = await response.json();
      alert(`Successfully imported ${result.importedCount} files`);
      setSelectedFileIds([]);
    } catch (err) {
      setError('Error importing files: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImporting(false);
    }
  };
  
  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  
  return (
    <div className="google-drive-picker">
      <div className="actions">
        <Button 
          onClick={fetchFiles} 
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Load Google Drive Files'}
        </Button>
        
        <Button 
          onClick={importFiles} 
          disabled={importing || selectedFileIds.length === 0}
          variant="primary"
        >
          {importing ? <Spinner size="sm" /> : `Import Selected (${selectedFileIds.length})`}
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="files-list">
        {files.map(file => (
          <div 
            key={file.id} 
            className={`file-item ${selectedFileIds.includes(file.id) ? 'selected' : ''}`}
            onClick={() => toggleFileSelection(file.id)}
          >
            <div className="file-icon">
              {file.mimeType.includes('pdf') ? '📄' : 
               file.mimeType.includes('text') ? '📝' : 
               file.mimeType.includes('spreadsheet') ? '📊' : 
               file.mimeType.includes('document') ? '📃' : '📁'}
            </div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-date">
                {new Date(file.createdTime).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        
        {files.length === 0 && !loading && (
          <div className="no-files">
            No files found. Click "Load Google Drive Files" to fetch your files.
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDrivePicker;
```

## Usage Flow

1. User clicks "Connect with Google Drive" in your application
2. User is redirected to Google's OAuth consent screen
3. User grants permissions to your application
4. User is redirected back to your application
5. Your app retrieves and stores OAuth tokens
6. User can now browse and select files from their Google Drive
7. Selected files are downloaded from Google Drive and uploaded to S3
8. Files in S3 can then be processed for embedding and storage in Neo4j/OpenSearch

## Security Considerations

1. Store OAuth tokens securely
2. Use refresh tokens to maintain access
3. Implement proper error handling
4. Set up monitoring for API quota usage
5. Consider implementing rate limiting for file imports
6. Handle large files appropriately with chunking or streaming
7. Use HTTPS for all communications