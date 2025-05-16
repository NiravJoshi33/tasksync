import { WebClient } from '@slack/web-api';
import { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } from '$env/static/private';

interface TaskData {
	taskDate: string;
	startTime?: string;
	endTime?: string;
	taskDescription: string;
	taskType: string;
	taskStatus: string;
	taskComments?: string;
	submittedBy: string;
	submissionTimestamp: string;
}

let slackWebClient: WebClient | null = null;

function getSlackClient(): WebClient | null {
	if (!SLACK_BOT_TOKEN) {
		console.error('[SlackNotifier] SLACK_BOT_TOKEN is not configured.');
		return null;
	}
	if (!slackWebClient) {
		slackWebClient = new WebClient(SLACK_BOT_TOKEN);
	}
	return slackWebClient;
}

function formatTaskForSlack(taskData: TaskData): string {
	const {
		taskDate,
		taskDescription,
		taskType,
		taskStatus,
		taskComments,
		submittedBy,
		submissionTimestamp
	} = taskData;

	// Format date for better readability, e.g., May 16, 2025
	const formattedEventDate = new Date(taskDate).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const submittedAt = new Date(submissionTimestamp).toLocaleString('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let message = `*New Task Logged by ${submittedBy}*\n`;
	message += `*Date:* ${formattedEventDate}\n`;
	message += `*Task:* ${taskDescription}\n`;
	message += `*Type:* ${taskType}\n`;
	message += `*Status:* ${taskStatus}\n`;
	if (taskComments && taskComments.trim() !== '') {
		message += `*Comments:* ${taskComments}\n`;
	}
	message += `_Submitted at: ${submittedAt}_`;

	return message;
}

export async function sendSlackNotification(taskData: TaskData): Promise<boolean> {
	if (!SLACK_CHANNEL_ID) {
		console.error('[SlackNotifier] SLACK_CHANNEL_ID is not configured.');
		return false;
	}

	const client = getSlackClient();
	if (!client) {
		console.error('[SlackNotifier] Failed to initialize Slack client.');
		return false;
	}

	const messageText = formatTaskForSlack(taskData);

	try {
		const result = await client.chat.postMessage({
			channel: SLACK_CHANNEL_ID,
			text: messageText, // Fallback text for notifications
			mrkdwn: true // Ensure markdown is enabled for formatting
			// We could use blocks for richer formatting later if needed:
			// blocks: [
			//   {
			//     "type": "section",
			//     "text": {
			//       "type": "mrkdwn",
			//       "text": messageText
			//     }
			//   }
			// ]
		});

		if (result.ok) {
			console.log(
				'[SlackNotifier] Message sent successfully to channel',
				SLACK_CHANNEL_ID,
				'ts:',
				result.ts
			);
			return true;
		} else {
			console.error('[SlackNotifier] Error sending message:', result.error);
			return false;
		}
	} catch (error) {
		console.error('[SlackNotifier] Failed to send Slack message:', error);
		return false;
	}
}
