# TaskSync: Daily Task Logger

TaskSync is a SvelteKit application for logging daily tasks to a Google Sheet and notifying a Slack channel.

## Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) (version 18.x or later recommended) and [pnpm](https://pnpm.io/installation) installed.

## Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/NiravJoshi33/tasksync.git
    cd tasksync
    ```

2.  **Install Dependencies:**
    Use pnpm to install the project dependencies:

    ```bash
    pnpm install
    ```

3.  **Set Up Environment Variables:**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and fill in the required values. See the "Environment Variables" section below for details on how to obtain these.

## Environment Variables

You need to configure the following environment variables in your `.env` file:

- `GOOGLE_SHEET_ID`: The ID of your Google Sheet.
  - **How to find:** Open your Google Sheet. The ID is the long string of characters in the URL between `/d/` and `/edit`. For example, in `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit#gid=0`, `YOUR_SHEET_ID_HERE` is the ID.
- `GOOGLE_SHEET_NAME`: The name of the specific sheet (tab) within your Google Spreadsheet where data will be logged.
  - **How to find:** This is the name of the tab at the bottom of your Google Sheet interface (e.g., "Sheet1", "Log").
- `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON`: The JSON content of your Google Cloud Service Account key.
  - **How to obtain:**
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Select your project or create a new one.
    3.  Navigate to "IAM & Admin" > "Service Accounts".
    4.  Click "+ CREATE SERVICE ACCOUNT". Give it a name (e.g., "tasksync-sheets-writer") and an optional description. Grant it the "Editor" role for the project, or at least roles/iam.serviceAccountUser and roles that allow writing to Google Sheets (like "Google Sheets API Editor" - you might need to enable the Google Sheets API for your project first under "APIs & Services" > "Enabled APIs & services").
    5.  Once created, click on the service account email.
    6.  Go to the "KEYS" tab.
    7.  Click "ADD KEY" > "Create new key".
    8.  Choose "JSON" as the key type and click "CREATE". A JSON file will be downloaded.
    9.  **Important:** Open this JSON file, copy its _entire content_, and paste it as a single line string into the `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON` variable in your `.env` file. Make sure to escape any special characters if necessary (though typically, for a single-line JSON string, this isn't an issue if pasted carefully).
    10. **Share your Google Sheet**: You must share your Google Sheet with the `client_email` found within the downloaded JSON credentials file. Give it "Editor" permissions on the sheet.
- `SLACK_BOT_TOKEN`: Your Slack app's Bot User OAuth Token.
  - **How to obtain:**
    1.  Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app or select an existing one.
    2.  In the "Add features and functionality" section, click on "Permissions".
    3.  Under "Bot Token Scopes", add the `chat:write` scope.
    4.  Navigate to "Install App" (or "Reinstall App" if you added scopes) from the sidebar and install the app to your workspace.
    5.  After installation, you'll find the "Bot User OAuth Token" (it starts with `xoxb-`) under "OAuth & Permissions" in the sidebar. Copy this token.
- `SLACK_CHANNEL_ID`: The ID of the Slack channel where notifications will be sent.
  - **How to find:**
    1.  Open Slack in your browser (not the desktop app, as it's easier to get the ID from the URL).
    2.  Navigate to the channel you want to use.
    3.  The channel ID is the last part of the URL (e.g., in `https://app.slack.com/client/YOUR_WORKSPACE_ID/C0123ABCDEF`, `C0123ABCDEF` is the channel ID).
    4.  Ensure your Slack App (Bot) is a member of this channel. You can invite it by typing `/invite @YourBotName` in the channel.

**Example `.env` file structure:**

```
GOOGLE_SHEET_ID="your_sheet_id_here"
GOOGLE_SHEET_NAME="Sheet1"
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON='''{"type": "service_account", "project_id": "...", ...}'''
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_CHANNEL_ID="C0123ABCDEF"
```

**Note on `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON`:** It's recommended to paste the JSON as a single line. If you must use a multi-line string, ensure your environment variable loader supports it or handle newlines appropriately. The provided example uses single quotes around triple quotes to help with shell interpretation if you were to source it directly, but for SvelteKit's `$env/static/private`, just pasting the JSON string directly is usually fine.

## Running the Application

1.  **Start the Development Server:**

    ```bash
    pnpm dev
    ```

    This will start the SvelteKit development server, typically on `http://localhost:5173`.

2.  **Open in Browser:**
    Open your web browser and navigate to the local address provided by the development server.

## Using the Application

1.  **Access the Form:** The main page will display the task logging form.
2.  **Fill in Task Details:**
    - **Date:** Select the date for the task. Defaults to the current date.
    - **Start Time (Optional):** Enter the task's start time in HH:MM format.
    - **End Time (Optional):** Enter the task's end time in HH:MM format. Must be after start time if both are provided.
    - **Task Description:** Provide a detailed description of the task (minimum 10 characters).
    - **Task Type:** Select "Planned" or "New/Ad-hoc".
    - **Status:** Choose the current status of the task (e.g., "To Do", "In Progress", "Completed").
    - **Project:** Select the project this task belongs to.
    - **Comments/Updates:** Add any relevant comments (optional).
    - **Submitted By (Your Name):** Enter your name.
3.  **Log Task:** Click the "Log Task" button.
    - The form will validate your input on the client-side and server-side.
    - Upon successful submission:
      - The task data will be appended to the configured Google Sheet.
      - A notification will be sent to the configured Slack channel.
      - A success message will appear on the page.
    - If there are validation errors or issues with saving the data, an error message will be displayed with details.

## Google Sheet Columns

Ensure your Google Sheet (specified by `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_NAME`) has the following columns in this order. The application will append data starting from the first empty row.

1.  Submission Timestamp
2.  Day of the Week
3.  Task Date
4.  Start Time
5.  End Time
6.  Task Description
7.  Task Type
8.  Status
9.  Comments/Updates
10. Project
11. Submitted By

---
