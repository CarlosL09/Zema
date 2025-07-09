import { storage } from '../storage';

export class VideoMeetingService {
  private zoomApiBase = 'https://api.zoom.us/v2';
  private teamsApiBase = 'https://graph.microsoft.com/v1.0';

  async getAuthUrl(platform: 'zoom' | 'teams'): Promise<string> {
    switch (platform) {
      case 'zoom':
        return this.getZoomAuthUrl();
      case 'teams':
        return this.getTeamsAuthUrl();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private getZoomAuthUrl(): string {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const redirectUri = process.env.ZOOM_REDIRECT_URI || 'http://localhost:5000/auth/zoom/callback';
    
    return `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  private getTeamsAuthUrl(): string {
    const clientId = process.env.TEAMS_CLIENT_ID;
    const redirectUri = process.env.TEAMS_REDIRECT_URI || 'http://localhost:5000/auth/teams/callback';
    const scopes = 'OnlineMeetings.ReadWrite';
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  }

  async exchangeCodeForTokens(platform: 'zoom' | 'teams', code: string, userId: string): Promise<void> {
    switch (platform) {
      case 'zoom':
        return this.exchangeZoomCode(code, userId);
      case 'teams':
        return this.exchangeTeamsCode(code, userId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async exchangeZoomCode(code: string, userId: string): Promise<void> {
    try {
      const clientId = process.env.ZOOM_CLIENT_ID;
      const clientSecret = process.env.ZOOM_CLIENT_SECRET;
      const redirectUri = process.env.ZOOM_REDIRECT_URI || 'http://localhost:5000/auth/zoom/callback';

      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`Zoom OAuth error: ${tokens.error_description || tokens.error}`);
      }

      await storage.createIntegration({
        userId,
        type: 'video_meeting',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        settings: {
          provider: 'zoom',
          scope: tokens.scope
        }
      });
    } catch (error) {
      console.error('Zoom token exchange failed:', error);
      throw new Error('Failed to connect Zoom');
    }
  }

  private async exchangeTeamsCode(code: string, userId: string): Promise<void> {
    try {
      const clientId = process.env.TEAMS_CLIENT_ID;
      const clientSecret = process.env.TEAMS_CLIENT_SECRET;
      const redirectUri = process.env.TEAMS_REDIRECT_URI || 'http://localhost:5000/auth/teams/callback';

      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`Teams OAuth error: ${tokens.error_description || tokens.error}`);
      }

      await storage.createIntegration({
        userId,
        type: 'video_meeting',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        settings: {
          provider: 'teams',
          scope: tokens.scope
        }
      });
    } catch (error) {
      console.error('Teams token exchange failed:', error);
      throw new Error('Failed to connect Teams');
    }
  }

  async createMeeting(userId: string, platform: 'zoom' | 'teams', meetingData: {
    topic: string;
    startTime: Date;
    duration: number; // in minutes
    agenda?: string;
    password?: string;
    waitingRoom?: boolean;
    recordingEnabled?: boolean;
  }) {
    switch (platform) {
      case 'zoom':
        return this.createZoomMeeting(userId, meetingData);
      case 'teams':
        return this.createTeamsMeeting(userId, meetingData);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async createZoomMeeting(userId: string, meetingData: any) {
    try {
      const accessToken = await this.getAccessToken(userId, 'zoom');
      
      const meetingConfig = {
        topic: meetingData.topic,
        type: 2, // Scheduled meeting
        start_time: meetingData.startTime.toISOString(),
        duration: meetingData.duration,
        agenda: meetingData.agenda || '',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2,
          audio: 'both',
          auto_recording: meetingData.recordingEnabled ? 'local' : 'none',
          waiting_room: meetingData.waitingRoom !== false
        }
      };

      if (meetingData.password) {
        meetingConfig.settings.password = meetingData.password;
      }

      const response = await fetch(`${this.zoomApiBase}/users/me/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingConfig)
      });

      const meeting = await response.json();

      if (!response.ok) {
        throw new Error(`Zoom API error: ${meeting.message || 'Unknown error'}`);
      }

      return {
        id: meeting.id,
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
        password: meeting.password,
        meetingId: meeting.id.toString(),
        platform: 'zoom' as const
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  private async createTeamsMeeting(userId: string, meetingData: any) {
    try {
      const accessToken = await this.getAccessToken(userId, 'teams');
      
      const meetingConfig = {
        subject: meetingData.topic,
        startDateTime: meetingData.startTime.toISOString(),
        endDateTime: new Date(meetingData.startTime.getTime() + meetingData.duration * 60000).toISOString(),
        participants: {
          organizer: {
            identity: {
              user: {
                id: userId // This should be the actual user's Teams ID
              }
            }
          }
        }
      };

      const response = await fetch(`${this.teamsApiBase}/me/onlineMeetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingConfig)
      });

      const meeting = await response.json();

      if (!response.ok) {
        throw new Error(`Teams API error: ${meeting.error?.message || 'Unknown error'}`);
      }

      return {
        id: meeting.id,
        joinUrl: meeting.joinUrl || meeting.joinWebUrl,
        startUrl: meeting.joinUrl || meeting.joinWebUrl,
        meetingId: meeting.conferenceId,
        platform: 'teams' as const
      };
    } catch (error) {
      console.error('Error creating Teams meeting:', error);
      throw new Error('Failed to create Teams meeting');
    }
  }

  async generateMeetingLink(platform: 'zoom' | 'teams' | 'meet' | 'webex', meetingData?: any): Promise<string> {
    switch (platform) {
      case 'meet':
        // Generate Google Meet link (requires calendar integration)
        const meetId = Math.random().toString(36).substring(2, 10);
        return `https://meet.google.com/${meetId}`;
      
      case 'webex':
        // For Webex, you'd typically create a meeting through their API
        // This is a simplified version
        return `https://company.webex.com/meet/room${Date.now()}`;
      
      case 'zoom':
      case 'teams':
        // These require OAuth and API calls (handled above)
        throw new Error(`${platform} requires authentication. Use createMeeting instead.`);
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getAccessToken(userId: string, platform: 'zoom' | 'teams'): Promise<string> {
    const integrations = await storage.getIntegrations(userId);
    const integration = integrations.find(i => 
      i.type === 'video_meeting' && 
      i.isActive && 
      i.settings?.provider === platform
    );

    if (!integration?.accessToken) {
      throw new Error(`${platform} not connected`);
    }

    // Check if token needs refresh
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      await this.refreshAccessToken(userId, integration, platform);
      return this.getAccessToken(userId, platform); // Retry with new token
    }

    return integration.accessToken;
  }

  private async refreshAccessToken(userId: string, integration: any, platform: 'zoom' | 'teams'): Promise<void> {
    try {
      let refreshUrl: string;
      let body: URLSearchParams;
      let headers: Record<string, string>;

      if (platform === 'zoom') {
        const clientId = process.env.ZOOM_CLIENT_ID;
        const clientSecret = process.env.ZOOM_CLIENT_SECRET;
        
        refreshUrl = 'https://zoom.us/oauth/token';
        body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: integration.refreshToken
        });
        headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        };
      } else {
        const clientId = process.env.TEAMS_CLIENT_ID;
        const clientSecret = process.env.TEAMS_CLIENT_SECRET;
        
        refreshUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        body = new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: 'refresh_token',
          refresh_token: integration.refreshToken
        });
        headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      }

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers,
        body
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${tokens.error_description || tokens.error}`);
      }

      await storage.updateIntegration(integration.id, {
        accessToken: tokens.access_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });
    } catch (error) {
      console.error(`Error refreshing ${platform} token:`, error);
      throw new Error(`Failed to refresh ${platform} access token`);
    }
  }

  async getMeetingDetails(userId: string, platform: 'zoom' | 'teams', meetingId: string) {
    try {
      const accessToken = await this.getAccessToken(userId, platform);
      let url: string;

      if (platform === 'zoom') {
        url = `${this.zoomApiBase}/meetings/${meetingId}`;
      } else {
        url = `${this.teamsApiBase}/me/onlineMeetings/${meetingId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const meeting = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to get meeting details: ${meeting.error?.message || meeting.message}`);
      }

      return meeting;
    } catch (error) {
      console.error('Error getting meeting details:', error);
      throw new Error('Failed to get meeting details');
    }
  }

  async cancelMeeting(userId: string, platform: 'zoom' | 'teams', meetingId: string) {
    try {
      const accessToken = await this.getAccessToken(userId, platform);
      let url: string;
      let method = 'DELETE';

      if (platform === 'zoom') {
        url = `${this.zoomApiBase}/meetings/${meetingId}`;
      } else {
        url = `${this.teamsApiBase}/me/onlineMeetings/${meetingId}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to cancel meeting: ${error.error?.message || error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling meeting:', error);
      throw new Error('Failed to cancel meeting');
    }
  }
}