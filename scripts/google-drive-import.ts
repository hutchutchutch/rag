#!/usr/bin/env ts-node
/**
 * Google Drive Import Script
 * 
 * This script allows importing documents from Google Drive to S3 and processing
 * them for the RAG application.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { program } from 'commander';
import { createInterface } from 'readline';
import { Readable } from 'stream';
import open from 'open';

dotenv.config();

// Google API configuration
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const CREDENTIALS_PATH = path.join(__dirname, '../.credentials/google-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../.credentials/google-token.json');

// S3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

// Command line arguments
program
  .option('-f, --file-id <id>', 'Specific Google Drive file ID to import')
  .option('-q, --query <query>', 'Google Drive search query, e.g. "mimeType=\'application/pdf\'"')
  .option('-l, --limit <number>', 'Limit the number of files to import', '10')
  .option('-d, --download-dir <path>', 'Directory to download files to (defaults to tmp)', '/tmp/google-drive-import')
  .option('--list-only', 'Only list files without downloading', false)
  .option('--no-upload', 'Skip uploading to S3', false)
  .parse(process.argv);

const options = program.opts();

// Create download directory if it doesn't exist
if (!fs.existsSync(options.downloadDir)) {
  fs.mkdirSync(options.downloadDir, { recursive: true });
}

// Main function
async function main() {
  try {
    // Get OAuth2 client
    const oAuth2Client = await getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    
    if (options.fileId) {
      // Import specific file
      await importFile(drive, options.fileId);
    } else {
      // List and import files based on query
      const defaultQuery = "mimeType='application/pdf' or mimeType='text/plain' or mimeType='application/vnd.google-apps.document'";
      const query = options.query || defaultQuery;
      const limit = parseInt(options.limit, 10);
      
      await listAndImportFiles(drive, query, limit);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get OAuth2 client with tokens
async function getAuthenticatedClient() {
  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(
      'Error: Google credentials file not found at',
      CREDENTIALS_PATH
    );
    console.log(
      'Please download OAuth credentials from Google Cloud Console and save them to this path.'
    );
    process.exit(1);
  }

  // Load client secrets
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content.toString());
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have a token saved
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
    oAuth2Client.setCredentials(token);
    console.log('Using saved Google authentication token');
    return oAuth2Client;
  }

  // No token, get a new one
  return await getNewToken(oAuth2Client);
}

// Get new token after prompting for user authorization
async function getNewToken(oAuth2Client: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force approval prompt to get refresh token
  });
  
  console.log('Authorize this app by visiting this URL:', authUrl);
  
  // Open the URL in the default browser
  open(authUrl);
  
  // Prompt for the authorization code
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const code = await new Promise<string>((resolve) => {
    rl.question('Enter the authorization code: ', (code) => {
      rl.close();
      resolve(code);
    });
  });
  
  // Exchange code for tokens
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  
  // Save token to file
  if (!fs.existsSync(path.dirname(TOKEN_PATH))) {
    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token saved to', TOKEN_PATH);
  
  return oAuth2Client;
}

// List and import files based on query
async function listAndImportFiles(drive: any, query: string, limit: number) {
  console.log(`Searching files with query: ${query}`);
  
  try {
    const res = await drive.files.list({
      q: query,
      pageSize: limit,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc'
    });
    
    const files = res.data.files;
    if (files.length === 0) {
      console.log('No files found.');
      return;
    }
    
    console.log(`Found ${files.length} files:`);
    files.forEach((file, i) => {
      console.log(`${i + 1}. ${file.name} (${file.mimeType}) - ID: ${file.id}`);
    });
    
    if (options.listOnly) {
      return;
    }
    
    // Import each file
    for (const file of files) {
      await importFile(drive, file.id, file.name, file.mimeType);
    }
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Import a single file
async function importFile(drive: any, fileId: string, fileName?: string, mimeType?: string) {
  // If filename is not provided, fetch it
  if (!fileName || !mimeType) {
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,mimeType'
    });
    fileName = fileMetadata.data.name;
    mimeType = fileMetadata.data.mimeType;
  }
  
  console.log(`Importing: ${fileName} (${mimeType})`);
  
  // Handle Google Docs format
  let downloadMimeType = mimeType;
  if (mimeType === 'application/vnd.google-apps.document') {
    downloadMimeType = 'application/pdf';
    fileName = `${fileName}.pdf`;
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    downloadMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    fileName = `${fileName}.xlsx`;
  }
  
  const filePath = path.join(options.downloadDir, fileName);
  
  try {
    // Download file
    const res = await drive.files.get(
      {
        fileId,
        alt: 'media',
        ...(downloadMimeType !== mimeType ? { mimeType: downloadMimeType } : {})
      },
      { responseType: 'stream' }
    );
    
    // Save file to disk
    const dest = fs.createWriteStream(filePath);
    
    await new Promise<void>((resolve, reject) => {
      res.data
        .on('end', () => {
          console.log(`Downloaded ${fileName}`);
          resolve();
        })
        .on('error', (err: Error) => {
          console.error('Error downloading file:', err);
          reject(err);
        })
        .pipe(dest);
    });
    
    // Upload to S3 if option is enabled
    if (options.upload) {
      if (!S3_BUCKET_NAME) {
        console.error('Error: S3_BUCKET_NAME is not set in environment variables');
        return;
      }
      
      await uploadToS3(filePath, fileName, downloadMimeType);
    }
    
    return { fileId, filePath };
  } catch (error) {
    console.error(`Error importing file ${fileId}:`, error);
    throw error;
  }
}

// Upload file to S3
async function uploadToS3(filePath: string, fileName: string, contentType: string) {
  const fileContent = fs.readFileSync(filePath);
  const s3Key = `documents/google-drive/${Date.now()}-${fileName}`;
  
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType
      })
    );
    
    console.log(`Uploaded to S3: s3://${S3_BUCKET_NAME}/${s3Key}`);
    return s3Key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

// Run the main function
main();