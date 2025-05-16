import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { appendToSheet } from '$lib/server/googleSheets';
import { sendSlackNotification } from '$lib/server/slackNotifier';

// Helper to validate time format (HH:MM)
function isValidTimeFormat(timeString: string): boolean {
	if (!timeString) return true; // Optional field, so empty is valid
	return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
}

export const actions: Actions = {
	logTask: async ({ request }) => {
		const formData = await request.formData();
		const taskData = {
			taskDate: formData.get('taskDate') as string,
			startTime: (formData.get('startTime') as string) || '', // Ensure empty string if null/undefined
			endTime: (formData.get('endTime') as string) || '', // Ensure empty string if null/undefined
			taskDescription: formData.get('taskDescription') as string,
			taskType: formData.get('taskType') as string,
			taskStatus: formData.get('taskStatus') as string,
			taskComments: formData.get('taskComments') as string,
			submittedBy: formData.get('submittedBy') as string,
			project: formData.get('project') as string,
			submissionTimestamp: new Date().toISOString()
		};

		const errors: Record<string, string> = {};
		// Server-Side Validation
		if (!taskData.taskDate) errors.taskDate = 'Date is required.';
		else if (!/^\d{4}-\d{2}-\d{2}$/.test(taskData.taskDate))
			errors.taskDate = 'Date must be in YYYY-MM-DD format.';

		if (taskData.startTime && !isValidTimeFormat(taskData.startTime)) {
			errors.startTime = 'Start time must be in HH:MM format.';
		}
		if (taskData.endTime && !isValidTimeFormat(taskData.endTime)) {
			errors.endTime = 'End time must be in HH:MM format.';
		}
		// Optional: Add logic to ensure endTime is after startTime if both are provided
		if (taskData.startTime && taskData.endTime && taskData.startTime >= taskData.endTime) {
			errors.endTime = 'End time must be after start time.';
		}

		if (!taskData.taskDescription) errors.taskDescription = 'Task description is required.';
		else if (taskData.taskDescription.length < 10)
			errors.taskDescription = 'Task description must be at least 10 characters long.';
		if (!taskData.taskType) errors.taskType = 'Task type is required.';
		if (!taskData.taskStatus) errors.taskStatus = 'Status is required.';
		if (!taskData.submittedBy) errors.submittedBy = 'Submitted by is required.';

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				data: taskData,
				errors,
				errorMessage: 'Please correct the errors in the form.'
			});
		}

		// Google Sheets Integration - Order matters for columns
		const rowDataForSheet = [
			taskData.submissionTimestamp,
			new Date(taskData.taskDate).toLocaleDateString('en-IN', { weekday: 'long' }),
			taskData.taskDate,
			taskData.startTime, // New column
			taskData.endTime, // New column
			taskData.taskDescription,
			taskData.taskType,
			taskData.taskStatus,
			taskData.taskComments,
			taskData.project,
			taskData.submittedBy
		];

		try {
			const sheetAppendSuccess = await appendToSheet([rowDataForSheet]);
			if (!sheetAppendSuccess) {
				console.error('Form Action: Failed to append data to Google Sheet.');
				return fail(500, {
					data: taskData,
					errorMessage:
						'Server error: Could not save task to Google Sheets. Please try again later.'
				});
			}
			console.log('Form Action: Task data successfully appended to Google Sheet.');

			// Slack Integration
			sendSlackNotification(taskData)
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
				successMessage: `Task '${taskData.taskDescription.substring(0, 30)}...' logged by ${taskData.submittedBy} for ${taskData.taskDate}!`,
				errors: errors,
				data: { ...taskData, startTime: '', endTime: '' } // Return empty times on success for form reset
			};
		} catch (error) {
			console.error('Form Action: Unexpected error during Google Sheets integration:', error);
			return fail(500, {
				data: taskData,
				errors: errors,
				errorMessage:
					'Server error: An unexpected issue occurred while saving your task. Please try again later.'
			});
		}
	}
};
