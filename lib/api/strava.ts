import { StravaActivity, StravaAthlete, StravaTokenResponse } from '@/types/strava';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth';

export class StravaAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'StravaAPIError';
  }
}

class StravaClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new StravaAPIError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async makeAuthenticatedRequest(url: string, accessToken: string, options: RequestInit = {}) {
    return this.makeRequest(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read',
      state,
    });

    return `${STRAVA_OAUTH_URL}/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
    const response = await this.makeRequest(`${STRAVA_OAUTH_URL}/token`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    return response as StravaTokenResponse;
  }

  async refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
    const response = await this.makeRequest(`${STRAVA_OAUTH_URL}/token`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    return response as StravaTokenResponse;
  }

  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    return this.makeAuthenticatedRequest(`${STRAVA_BASE_URL}/athlete`, accessToken);
  }

  async getActivities(
    accessToken: string,
    before?: number,
    after?: number,
    page = 1,
    perPage = 30
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (before) params.append('before', before.toString());
    if (after) params.append('after', after.toString());

    const activities = await this.makeAuthenticatedRequest(
      `${STRAVA_BASE_URL}/athlete/activities?${params.toString()}`,
      accessToken
    );

    return (activities as StravaActivity[]).filter(activity => 
      activity.sport_type === 'Run' || activity.type === 'Run'
    );
  }

  async getRecentRunningActivities(
    accessToken: string,
    weeks = 12
  ): Promise<StravaActivity[]> {
    const after = Math.floor(Date.now() / 1000) - (weeks * 7 * 24 * 60 * 60);
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200;

    try {
      while (true) {
        const activities = await this.getActivities(accessToken, undefined, after, page, perPage);
        
        if (activities.length === 0) break;
        
        allActivities.push(...activities);
        
        if (activities.length < perPage) break;
        
        page++;
        
        if (page > 10) break;
      }

      return allActivities.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
    } catch (error) {
      if (error instanceof StravaAPIError && error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }

  async getRecentCyclingActivities(
    accessToken: string,
    weeks = 12
  ): Promise<StravaActivity[]> {
    const after = Math.floor(Date.now() / 1000) - (weeks * 7 * 24 * 60 * 60);
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200;

    try {
      while (true) {
        const activities = await this.getCyclingActivities(accessToken, undefined, after, page, perPage);
        
        if (activities.length === 0) break;
        
        allActivities.push(...activities);
        
        if (activities.length < perPage) break;
        
        page++;
        
        if (page > 10) break;
      }

      return allActivities.sort((a, b) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
    } catch (error) {
      if (error instanceof StravaAPIError && error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }

  async getCyclingActivities(
    accessToken: string,
    before?: number,
    after?: number,
    page = 1,
    perPage = 30
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (before) params.append('before', before.toString());
    if (after) params.append('after', after.toString());

    const activities = await this.makeAuthenticatedRequest(
      `${STRAVA_BASE_URL}/athlete/activities?${params.toString()}`,
      accessToken
    );

    return (activities as StravaActivity[]).filter(activity => 
      activity.sport_type === 'Ride' || activity.type === 'Ride'
    );
  }
}

export const stravaClient = new StravaClient();