import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Define the scope for Calendar API access
# This scope allows full read/write access to the user's calendars.
SCOPES = ['https://www.googleapis.com/auth/calendar']
CALENDAR_ID = 'primary' # Use the user's primary calendar

def authenticate_calendar():
    """Authenticates with Google and returns the service object."""
    creds = None
    
    # 1. Check for existing token.json file
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # 2. If token is invalid or expired, refresh it or prompt login
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # This triggers the browser window for user login
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # 3. Save the new/refreshed token
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    # 4. Build and return the Calendar API service
    service = build('calendar', 'v3', credentials=creds)
    return service

# --- Initial Setup Step ---
# Run this file directly ONCE to generate the token.json file.
if __name__ == '__main__':
    print("Starting authentication. A browser window will open...")
    service = authenticate_calendar()
    print("Authentication successful! token.json created.")