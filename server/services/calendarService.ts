import { google } from 'googleapis';
import OpenAI from "openai";
import { storage } from "../storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
  location?: string;
}

interface MeetingRequest {
  requesterEmail: string;
  subject: string;
  proposedTimes?: string[];
  duration?: number; // minutes
  attendees?: string[];
  location?: string;
  description?: string;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

export class CalendarService {
  
  /**
   * Detect meeting requests in emails using AI
   */
  async detectMeetingRequest(emailContent: string, subject: string): Promise<MeetingRequest | null> {
    try {
      const prompt = `Analyze this email to detect if it contains a meeting request or scheduling inquiry:

Subject: ${subject}
Content: ${emailContent}

If this email contains a meeting request, extract the following information and return as JSON:
{
  "isMeetingRequest": true,
  "requesterEmail": "email address",
  "subject": "meeting subject/purpose",
  "proposedTimes": ["any specific times mentioned"],
  "duration": minutes_as_number,
  "attendees": ["list of email addresses"],
  "location": "location if specified",
  "description": "brief description of meeting purpose"
}

If this is NOT a meeting request, return:
{
  "isMeetingRequest": false
}

Look for phrases like: "let's schedule", "meet up", "available for", "book a meeting", "calendar", "call", "zoom", etc.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at detecting meeting requests in emails. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (result.isMeetingRequest) {
        return {
          requesterEmail: result.requesterEmail,
          subject: result.subject,
          proposedTimes: result.proposedTimes || [],
          duration: result.duration || 60,
          attendees: result.attendees || [],
          location: result.location,
          description: result.description
        };
      }

      return null;

    } catch (error) {
      console.error("Error detecting meeting request:", error);
      return null;
    }
  }

  /**
   * Get calendar availability for a user
   */
  async getAvailability(userId: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]> {
    try {
      // Get user's calendar tokens
      const user = await storage.getUser(userId);
      if (!user?.calendarAccessToken) {
        throw new Error("No calendar access token found");
      }

      // Initialize Google Calendar API
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.calendarAccessToken,
        refresh_token: user.calendarRefreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Get busy times from calendar
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: 'primary' }]
        }
      });

      const busyTimes = response.data.calendars?.primary?.busy || [];

      // Generate availability slots (assuming 9 AM - 5 PM working hours)
      const availability: AvailabilitySlot[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;

        // Generate hourly slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
          const slotStart = new Date(d);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(d);
          slotEnd.setHours(hour + 1, 0, 0, 0);

          const isAvailable = !busyTimes.some(busy => {
            const busyStart = new Date(busy.start || '');
            const busyEnd = new Date(busy.end || '');
            return slotStart < busyEnd && slotEnd > busyStart;
          });

          availability.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: isAvailable
          });
        }
      }

      return availability;

    } catch (error) {
      console.error("Error getting availability:", error);
      throw new Error("Failed to get calendar availability");
    }
  }

  /**
   * Create a calendar event
   */
  async createEvent(userId: string, event: CalendarEvent): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.calendarAccessToken) {
        throw new Error("No calendar access token found");
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.calendarAccessToken,
        refresh_token: user.calendarRefreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      });

      return response.data.id || '';

    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  /**
   * Suggest optimal meeting times based on availability
   */
  async suggestMeetingTimes(userId: string, meetingRequest: MeetingRequest): Promise<{
    suggestedTimes: string[];
    message: string;
  }> {
    try {
      // Get availability for the next 14 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      const availability = await this.getAvailability(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Filter available slots
      const availableSlots = availability
        .filter(slot => slot.available)
        .slice(0, 5) // Top 5 suggestions
        .map(slot => slot.start);

      // Generate response message
      const prompt = `Generate a professional email response suggesting meeting times based on this request:

Original Request: ${meetingRequest.description}
Requester: ${meetingRequest.requesterEmail}
Subject: ${meetingRequest.subject}

Available times:
${availableSlots.map((time, i) => `${i + 1}. ${new Date(time).toLocaleString()}`).join('\n')}

Generate a friendly, professional response suggesting these times and asking the requester to confirm their preference.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional assistant helping to schedule meetings."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      });

      return {
        suggestedTimes: availableSlots,
        message: response.choices[0].message.content || ""
      };

    } catch (error) {
      console.error("Error suggesting meeting times:", error);
      throw new Error("Failed to suggest meeting times");
    }
  }

  /**
   * Process email for meeting scheduling
   */
  async processEmailForMeeting(userId: string, emailContent: string, subject: string, senderEmail: string): Promise<{
    isMeetingRequest: boolean;
    suggestedResponse?: string;
    suggestedTimes?: string[];
  }> {
    try {
      // Detect if this is a meeting request
      const meetingRequest = await this.detectMeetingRequest(emailContent, subject);
      
      if (!meetingRequest) {
        return { isMeetingRequest: false };
      }

      meetingRequest.requesterEmail = senderEmail;

      // Get suggested times and response
      const suggestion = await this.suggestMeetingTimes(userId, meetingRequest);

      return {
        isMeetingRequest: true,
        suggestedResponse: suggestion.message,
        suggestedTimes: suggestion.suggestedTimes
      };

    } catch (error) {
      console.error("Error processing email for meeting:", error);
      return { isMeetingRequest: false };
    }
  }

  /**
   * Auto-schedule confirmed meetings
   */
  async autoScheduleMeeting(userId: string, meetingDetails: {
    title: string;
    datetime: string;
    duration: number;
    attendees: string[];
    description?: string;
    location?: string;
  }): Promise<string> {
    try {
      const endTime = new Date(meetingDetails.datetime);
      endTime.setMinutes(endTime.getMinutes() + meetingDetails.duration);

      const event: CalendarEvent = {
        summary: meetingDetails.title,
        description: meetingDetails.description,
        start: {
          dateTime: meetingDetails.datetime,
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York'
        },
        attendees: meetingDetails.attendees.map(email => ({ email })),
        location: meetingDetails.location
      };

      const eventId = await this.createEvent(userId, event);
      return eventId;

    } catch (error) {
      console.error("Error auto-scheduling meeting:", error);
      throw new Error("Failed to auto-schedule meeting");
    }
  }
}

export const calendarService = new CalendarService();