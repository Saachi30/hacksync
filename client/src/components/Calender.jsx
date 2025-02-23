import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CalendarScheduler = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize Google API client
  useEffect(() => {
    const initializeGoogleAPI = async () => {
      try {
        // Load the Google API client library
        await window.gapi.load('client:auth2', initClient);
      } catch (error) {
        console.error('Error loading GAPI client:', error);
      }
    };

    // Add Google API script to document
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => initializeGoogleAPI();
    document.body.appendChild(script);
  }, []);

  const initClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: '659707936416-k1qd46o9itso5q5srnf943d7jc6n1ul6.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send'
      });

      // Listen for sign-in state changes
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    } catch (error) {
      console.error('Error initializing GAPI client:', error);
    }
  };

  const updateSigninStatus = (isSignedIn) => {
    setIsAuthenticated(isSignedIn);
    if (isSignedIn) {
      listUpcomingEvents();
    }
  };

  const handleAuthClick = () => {
    if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      window.gapi.auth2.getAuthInstance().signOut();
    } else {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const listUpcomingEvents = async () => {
    setLoading(true);
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      setEvents(events);
      
      // Get Gemini recommendations for the events
      await getGeminiRecommendations(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const getGeminiRecommendations = async (events) => {
    try {
      const response = await fetch('YOUR_GEMINI_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_GEMINI_API_KEY'
        },
        body: JSON.stringify({
          events: events.map(event => ({
            summary: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
          }))
        })
      });

      const recommendations = await response.json();
      setRecommendations(recommendations);
      
      // Send email with recommendations
      await sendEmailWithRecommendations(events, recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const sendEmailWithRecommendations = async (events, recommendations) => {
    try {
      // Create email content
      const emailContent = `
        Upcoming Schedule:
        ${events.map(event => `
          - ${event.summary}
          Start: ${event.start.dateTime || event.start.date}
          End: ${event.end.dateTime || event.end.date}
        `).join('\n')}

        Recommendations:
        ${recommendations.map(rec => `- ${rec}`).join('\n')}
      `;

      // Encode the email content
      const encodedEmail = btoa(
        `To: ${window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail()}
        Subject: Your Upcoming Schedule with AI Recommendations
        Content-Type: text/plain; charset=utf-8

        ${emailContent}`
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      // Send email using Gmail API
      await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedEmail
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Calendar Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAuthClick}
            className={`mb-4 ${isAuthenticated ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isAuthenticated ? 'Sign Out' : 'Sign In with Google'}
          </Button>

          {isAuthenticated && (
            <div className="space-y-4">
              <Button
                onClick={listUpcomingEvents}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh Events
              </Button>

              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Upcoming Events</h3>
                    {events.map((event, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-medium">{event.summary}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                        </p>
                        {event.description && (
                          <p className="text-sm mt-2">{event.description}</p>
                        )}
                      </Card>
                    ))}
                  </div>

                  {recommendations.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">AI Recommendations</h3>
                      {recommendations.map((rec, index) => (
                        <p key={index} className="text-sm">{rec}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarScheduler;