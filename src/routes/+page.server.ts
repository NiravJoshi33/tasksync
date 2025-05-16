import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { appendToSheet } from '$lib/server/googleSheets';
import { sendSlackNotification } from '$lib/server/slackNotifier';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const taskDate = formData.get('taskDate') as string;
		const taskDescription = formData.get('taskDescription') as string;
		const taskType = formData.get('taskType') as string;
		const taskStatus = formData.get('taskStatus') as string;
		const taskComments = formData.get('taskComments') as string;
		const submittedBy = formData.get('submittedBy') as string;

		const errors: Record<string, string> = {};

		// --- Server-Side Validation (PRD 4.2) ---
		if (!taskDate) {
			errors.taskDate = 'Date is required.';
		}
		// Basic date format check (can be more robust)
		else if (!/^\d{4}-\d{2}-\d{2}$/.test(taskDate)) {
			errors.taskDate = 'Date must be in YYYY-MM-DD format.';
		}

		if (!taskDescription) {
			errors.taskDescription = 'Task description is required.';
		} else if (taskDescription.length < 10) {
			errors.taskDescription = 'Task description must be at least 10 characters long.';
		}

		if (!taskType) {
			errors.taskType = 'Task type is required.';
		}
		// Can add validation for specific taskType values if needed

		if (!taskStatus) {
			errors.taskStatus = 'Status is required.';
		}
		// Can add validation for specific taskStatus values if needed

		if (!submittedBy) {
			errors.submittedBy = 'Submitted by is required.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				data: {
					// Return submitted data to repopulate form
					taskDate,
					taskDescription,
					taskType,
					taskStatus,
					taskComments,
					submittedBy
				},
				errors,
				errorMessage: 'Please correct the errors in the form.' // General error message
			});
		}

		// --- Data Processing (Simulated for now - PRD 4.3, 4.4) ---
		console.log('Server: Received task submission:', {
			taskDate,
			taskDescription,
			taskType,
			taskStatus,
			taskComments,
			submittedBy
		});

		// Data Processing - Google Sheets Integration (PRD 4.3)
		const submissionTimestamp = new Date().toISOString();
		const rowData = [
			submissionTimestamp,
			taskDate,
			taskDescription,
			taskType,
			taskStatus,
			taskComments,
			submittedBy
		];

		try {
			const sheetAppendSuccess = await appendToSheet([rowData]); // Pass data as a 2D array

			if (!sheetAppendSuccess) {
				console.error('Form Action: Failed to append data to Google Sheet.');
				return fail(500, {
					data: { taskDate, taskDescription, taskType, taskStatus, taskComments, submittedBy },
					errorMessage:
						'Server error: Could not save task to Google Sheets. Please try again later.'
				});
			}

			console.log('Form Action: Task data successfully appended to Google Sheet.');

			// Slack Integration (PRD 4.4) - Fire and forget, or log non-critical failure
			// Call after successful Google Sheets write
			sendSlackNotification({
				taskDate,
				taskDescription,
				taskType,
				taskStatus,
				taskComments,
				submittedBy,
				submissionTimestamp
			})
				.then((slackSuccess) => {
					if (slackSuccess) {
						console.log('Form Action: Slack notification sent successfully.');
					} else {
						console.warn(
							'Form Action: Failed to send Slack notification, but task was logged to Sheets.'
						);
					}
				})
				.catch((slackError) => {
					console.error('Form Action: Error sending Slack notification:', slackError);
				});

			return {
				success: true,
				successMessage: `Task '${taskDescription.substring(0, 30)}...' logged by ${submittedBy} for ${taskDate}!`,
				errors: errors
				// No need to return the data itself on success if form is reset client-side
			};
		} catch (error) {
			console.error('Form Action: Unexpected error during Google Sheets integration:', error);
			return fail(500, {
				data: { taskDate, taskDescription, taskType, taskStatus, taskComments, submittedBy },
				errorMessage:
					'Server error: An unexpected issue occurred while saving your task. Please try again later.',
				errors: errors
			});
		}
	}
};
