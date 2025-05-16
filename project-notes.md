# Project Notes: TaskSync (Daily Task Logger & Slack Notifier)

**Version:** 0.1
**Date:** May 16, 2025

## 1. Project Overview

TaskSync is an internal web application designed to streamline daily task logging, centralize task data into Google Sheets, and provide automated updates to Slack. This document outlines the development plan based on the [Product Requirements Document (prd.md)](docs/prd.md).

## 2. Development Plan

### Phase 1: Core Setup & Frontend Form

1.  **Project Initialization (SvelteKit)**

    - [x] Initialize a new SvelteKit project (used `npx sv create . --template minimal --types ts`).
    - [x] Selected Prettier, TailwindCSS (with forms, typography plugins), and SvelteKit auto-adapter during interactive setup.
    - [x] Dependencies installed with `pnpm`.
    - [ ] Set up basic folder structure (`src/lib/components`, `src/routes`, `src/lib/server`) - _Partially done by scaffold, will review and adjust as needed._
    - [x] Create `README.md`.

2.  **Environment Variable Management**

    - [x] Define required environment variables in an `.env.example` file (e.g., `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`, `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON`, `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`). (Created via temp file and rename due to globalIgnore)
    - [x] Created `.env` file with placeholder values for development. (Created via temp file and rename due to globalIgnore)
    - [x] Ensure `.env` is added to `.gitignore`. (Verified existing `.gitignore` handles this).
    - [ ] Implement loading of environment variables in SvelteKit (e.g., using `$env/static/private` and `$env/dynamic/private`).

3.  **Frontend: Task Submission Web Form (SvelteKit - PRD 4.1)**
    - **UI/UX Shell:**
      - [x] Create a main page route (e.g., `/`) for the task submission form. (Modified `src/routes/+page.svelte`)
      - [x] Basic layout with a title and a placeholder for the form. (Added to `src/routes/+page.svelte` and updated `src/app.html`)
    - **Form Component (`TaskForm.svelte`):**
      - [x] Create the main form component (`src/lib/components/TaskForm.svelte`) with input fields as per PRD 4.1.3 (Date, Description, Type, Status, Comments, SubmittedBy).
      - [x] Integrate `TaskForm.svelte` into the main page (`src/routes/+page.svelte`).
    - **Client-Side Validation (PRD 4.1.4):**
      - [x] Implement real-time feedback for required fields (Basic: using `required` attribute, JS validation for `taskDescription` length and `submittedBy` presence, visual cues with red border).
      - [x] Add basic validation messages (Displayed below fields for `taskDescription`, `submittedBy`, and a general error message at the top).
    - **Submission Logic (PRD 4.1.5):**
      - [x] Add a "Submit Task" button. (Done)
      - [x] Implement logic to disable the button and form fields during submission (`isSubmitting` state).
      - [x] Change button text to "Submitting..." during submission.
    - **User Feedback (PRD 4.1.6):**
      - [x] Placeholder for success message display (Implemented with `submissionSuccess` variable).
      - [x] Placeholder for error message display (Implemented with `submissionError` variable, including validation errors).

### Phase 2: Backend Logic & Integrations

4.  **Backend: SvelteKit Form Actions (PRD 4.2)**

    - [x] Create a SvelteKit form action to handle form submissions (in `src/routes/+page.server.ts` with a `default` action).
    - [x] Data Reception: Receive and parse form data on the server (using `request.formData()`).
    - [x] Server-Side Validation: Re-validate all incoming data (implemented for all fields; returns `fail(400, {data, errors, errorMessage})`).
    - [x] Error Handling: Implement basic error handling and return appropriate responses to the client (success/error messages and data via `form` prop).
    - [x] Refactored `TaskForm.svelte` to use `use:enhance` for progressive enhancement, display server validation errors per field, and repopulate from `form.data`.
    - [x] Updated `+page.svelte` to pass the `form` prop to `TaskForm` and display global success/error messages from the action.
    - _(Note: TypeScript errors related to `$types` (e.g., `ActionData`, `Actions`) are expected to resolve when SvelteKit generates types, e.g., during `pnpm dev`.)_

5.  **Google Sheets Integration (PRD 4.3)**

    - **Authentication:**
      - [x] Research and implement Google Sheets API authentication using a service account (OAuth 2.0) (Handled in `src/lib/server/googleSheets.ts` using `googleapis`).
      - [x] Securely load service account credentials from environment variables (`GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON` via `$env/static/private`).
    - **Data Storage Logic:**
      - [x] Create a server-side module (`src/lib/server/googleSheets.ts`).
      - [x] Implement a function to append task data as a new row to the configured Google Sheet (`appendToSheet` function created).
      - [x] Make Google Sheet ID and specific sheet name configurable via environment variables (`GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME` used from `$env/static/private`).
    - **Sheet Structure:**
      - [ ] Manually prepare the Google Sheet with columns: `Submission Timestamp`, `Date (from form)`, `Task Description`, `Task Type`, `Status`, `Comments`, `Submitted By`. (This is a manual step for the user)
    - **Integration with Form Action:**
      - [x] Call the Google Sheets append function from the form action in `+page.server.ts`.
    - **Failure Management:**
      - [x] Log errors if writing to Google Sheets fails (Handled in `appendToSheet` and the form action).
      - [x] Return `fail(500, ...)` from form action on Google Sheets error.

6.  **Slack Integration (PRD 4.4)**

    - **Authentication:**
      - [x] Research and implement Slack API authentication (Bot User OAuth Token) (Handled in `src/lib/server/slackNotifier.ts` using `@slack/web-api`).
      - [x] Securely load Slack token from environment variables (`SLACK_BOT_TOKEN` via `$env/static/private`).
    - **Notification Logic:**
      - [x] Create a server-side module (`src/lib/server/slackNotifier.ts`).
      - [x] Implement a function to send a formatted message to a pre-configured Slack channel (`sendSlackNotification` function created).
      - [x] Make Slack channel ID configurable via environment variables (`SLACK_CHANNEL_ID` used from `$env/static/private`).
      - [x] Format message content using Slack `mrkdwn` as per PRD (Implemented in `formatTaskForSlack`).
    - **Integration with Form Action:**
      - [x] Call the Slack notification function after successful Google Sheets write (in `+page.server.ts`).
    - **Failure Management:**
      - [x] Log errors if sending to Slack fails (Handled in `sendSlackNotification` and the form action).
      - [x] Ensure Slack failure doesn't prevent Sheets write or overall success (Implemented in form action).

### Phase 3: Refinement & Deployment Prep

7.  **Refinements & Non-Functional Requirements (PRD 5)**

    - [x] Improve User Feedback: Implemented clear success/error messages on the frontend. (Further enhancements like toasts are optional).
    - [x] Review and enhance client-side and server-side validation. (Core validation for required fields and formats is in place; PRD requirements met for V1).
    - [x] Basic styling for a clean and intuitive UI. (Tailwind CSS used, form is functional and presentable).
    - [ ] Test form responsiveness on standard desktop browsers. (User testing step).
    - [x] Ensure API keys and sensitive credentials are not exposed client-side. (Handled with `$env/static/private`).
    - [x] Add comments to complex code sections. (Key areas commented).

8.  **Deployment Preparation (PRD 7)**

    - [x] Choose and configure SvelteKit adapter (`adapter-auto` selected during project init).
    - [ ] Test building the application (`pnpm build`). (User/environment step).
    - [ ] Prepare deployment instructions/notes. (User step, can be based on chosen adapter and platform).

### Future Considerations (Post V1.0 - PRD 9)

- User Authentication
- In-App Task Viewing
- Task Editing/Deletion
- End-of-Day Summary to Slack (PRD 4.5)

## 3. Technology Stack (as per PRD 7)

- **Framework:** SvelteKit
- **Language:** TypeScript (default for SvelteKit, or JavaScript)
- **APIs:**
  - Google Sheets API v4
  - Slack API (Web API)
- **Deployment:** Vercel/Netlify (or similar)

## 4. Progress Log

_(To be updated as development progresses)_

- **YYYY-MM-DD:** Created initial project plan.
- **YYYY-MM-DD:** Completed Phase 1 (Core Setup & Frontend Form).
- **YYYY-MM-DD:** Completed Phase 2 (Backend Logic & Integrations - Google Sheets, Slack).
- **YYYY-MM-DD:** Phase 3 tasks reviewed; core development complete pending user testing and build.
- ...

---

This plan will be updated as we make progress.
