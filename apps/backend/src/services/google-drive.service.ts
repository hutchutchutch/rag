import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

class GoogleDriveService {
  private drive: drive_v3.Drive | null = null;
  private readonly scopes = ['https://www.googleapis.com/auth/drive.readonly'];
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  
  /**
   * Initialize the OAuth2 client
   */
  private getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      this.redirectUri
    );
    
    return oauth2Client;
  }
  
  /**
   * Get the authorization URL for Google OAuth
   */
  public getAuthUrl(): string {
    const oauth2Client = this.getOAuth2Client();
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }
  
  /**
   * Set up the drive client with the provided tokens
   */
  public async setupDriveClient(code: string): Promise<{ tokens: any; email: string }> {
    const oauth2Client = this.getOAuth2Client();
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Initialize drive client
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Get user email for identification
    const userInfo = await google.oauth2('v2').userinfo.get({ auth: oauth2Client });
    
    return { 
      tokens, 
      email: userInfo.data.email || 'unknown'
    };
  }
  
  /**
   * Set up drive client with existing tokens
   */
  public setTokens(tokens: any): void {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }
  
  /**
   * List files in user's Google Drive (Markdown files only)
   */
  public async listFiles(pageSize: number = 50, query: string = "mimeType='text/markdown' or mimeType contains 'md'"): Promise<drive_v3.Schema$File[]> {
    if (!this.drive) {
      throw new Error('Drive client not initialized. Please authenticate first.');
    }
    
    try {
      const response = await this.drive.files.list({
        pageSize,
        q: query,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)',
      });
      
      return response.data.files || [];
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      throw error;
    }
  }
  
  /**
   * Download a file from Google Drive to the local filesystem
   */
  public async downloadFile(fileId: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Drive client not initialized. Please authenticate first.');
    }
    
    try {
      // Get file metadata to determine name
      const fileMetadata = await this.drive.files.get({
        fileId,
        fields: 'name,mimeType'
      });
      
      // Create a unique filename to prevent collisions
      const fileName = `${uuidv4()}-${fileMetadata.data.name}`;
      const filePath = path.join(config.paths.uploads, fileName);
      
      // Download the file
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { 
        responseType: 'stream' 
      });
      
      // Save file to disk
      return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(filePath);
        response.data
          .on('error', (err: Error) => {
            reject(err);
          })
          .pipe(dest)
          .on('finish', () => {
            resolve(filePath);
          })
          .on('error', (err: Error) => {
            reject(err);
          });
      });
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Check if a token needs to be refreshed and refresh it if needed
   */
  public async refreshTokenIfNeeded(tokens: any): Promise<any> {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    // Check if token is expired or about to expire
    const expiryDate = oauth2Client.credentials.expiry_date as number;
    const now = Date.now();
    
    // If token is expired or will expire in the next 5 minutes
    if (!expiryDate || now >= expiryDate - 5 * 60 * 1000) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        return credentials;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
    
    return tokens;
  }
}

export default new GoogleDriveService();