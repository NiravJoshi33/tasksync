import { google } from 'googleapis';
import {
	GOOGLE_SHEET_ID,
	GOOGLE_SHEET_NAME,
	GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON
} from '$env/static/private';

const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface ServiceAccountCredentials {
	client_email?: string;
	private_key?: string;
}

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
	if (!GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON) {
		console.error('[GoogleSheets] Service Account JSON not configured.');
		return null;
	}
	try {
		const creds = JSON.parse(GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON);
		if (!creds.client_email || !creds.private_key) {
			console.error('[GoogleSheets] Service Account JSON missing client_email or private_key.');
			return null;
		}
		return creds as ServiceAccountCredentials;
	} catch (error) {
		console.error('[GoogleSheets] Failed to parse Service Account JSON:', error);
		return null;
	}
}

async function getSheetsClient() {
	const credentials = getServiceAccountCredentials();
	if (!credentials) return null;

	try {
		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: credentials.client_email,
				private_key: credentials.private_key?.replace(/\\n/g, '\\n')
			},
			scopes: SHEETS_SCOPES
		});
		return google.sheets({ version: 'v4', auth });
	} catch (error) {
		console.error('[GoogleSheets] API authentication failed:', error);
		return null;
	}
}

export async function appendToSheet(values: (string | number | boolean)[][]): Promise<boolean> {
	if (!GOOGLE_SHEET_ID || !GOOGLE_SHEET_NAME) {
		console.error('[GoogleSheets] GOOGLE_SHEET_ID or GOOGLE_SHEET_NAME not defined.');
		return false;
	}

	const sheetsClient = await getSheetsClient();
	if (!sheetsClient) {
		console.error('[GoogleSheets] Failed to get authenticated client.');
		return false;
	}

	try {
		// Find the last row in the sheet
		const lastRowResponse = await sheetsClient.spreadsheets.values.get({
			spreadsheetId: GOOGLE_SHEET_ID,
			range: `${GOOGLE_SHEET_NAME}!A:A`
		});
		const lastRow = lastRowResponse.data.values?.length || 0;

		const response = await sheetsClient.spreadsheets.values.append({
			spreadsheetId: GOOGLE_SHEET_ID,
			range: `${GOOGLE_SHEET_NAME}!A${lastRow + 1}`,
			valueInputOption: 'USER_ENTERED',
			insertDataOption: 'INSERT_ROWS',
			requestBody: { values }
		});

		if (response.status === 200) {
			console.log('[GoogleSheets] Data appended. Range:', response.data.updates?.updatedRange);
			return true;
		}
		console.error('[GoogleSheets] Error appending. Status:', response.status, response.statusText);
		return false;
	} catch (error) {
		console.error('[GoogleSheets] Error in appendToSheet operation:', error);
		return false;
	}
}

// Define an interface for the Task object based on sheet columns
interface SheetTask {
	id: string;
	submissionTimestamp: string;
	day: string;
	date: string;
	startTime: string;
	endTime: string;
	plannedTasksNotes: string;
	type: string;
	status: string;
	issues: string;
	projectProd: string;
}

export async function getTasksFromSheet(): Promise<SheetTask[]> {
	if (!GOOGLE_SHEET_ID || !GOOGLE_SHEET_NAME) {
		console.error('[GoogleSheets] GOOGLE_SHEET_ID or GOOGLE_SHEET_NAME not defined for reading.');
		return [];
	}

	const sheetsClient = await getSheetsClient();
	if (!sheetsClient) {
		console.error('[GoogleSheets] Failed to get authenticated client for reading.');
		return [];
	}

	try {
		const response = await sheetsClient.spreadsheets.values.get({
			spreadsheetId: GOOGLE_SHEET_ID,
			range: `${GOOGLE_SHEET_NAME}!A:J`
		});

		const rows = response.data.values;

		// Expecting structure: rows[0] is empty, rows[1] is headers, rows[2+] is data
		if (rows && rows.length >= 2) {
			// Need at least an empty row and a header row
			const headersFromSheet = rows[1] as string[]; // Headers are in the second element
			const actualDataRows = rows.slice(2); // Actual data starts from the third element

			if (actualDataRows.length > 0) {
				const headerMapping: { [key: string]: keyof SheetTask } = {
					'Submit Timestamp': 'submissionTimestamp',
					Day: 'day',
					Date: 'date',
					'Start Time': 'startTime',
					'End Time': 'endTime',
					'Planned Tasks/ Notes': 'plannedTasksNotes',
					Type: 'type',
					Status: 'status',
					Issues: 'issues',
					'Project/ Product': 'projectProd' // Updated to match log
				};

				const tasks = actualDataRows.map((row, index) => {
					const task: Partial<SheetTask> = { id: (index + 1).toString() };
					headersFromSheet.forEach((header, i) => {
						const mappedKey = headerMapping[header.trim()];
						if (mappedKey) {
							// Ensure we don't try to access an index out of bounds for the current row
							if (i < row.length) {
								task[mappedKey] = row[i] || '';
							} else {
								task[mappedKey] = ''; // Default for missing cells in a row
							}
						}
					});
					return task as SheetTask;
				});
				console.log(`[GoogleSheets] Fetched ${tasks.length} tasks.`);
				return tasks;
			} else {
				console.log('[GoogleSheets] No data rows found after headers.');
				return [];
			}
		} else {
			console.log(
				'[GoogleSheets] Sheet data is empty or structure is unexpected (less than 2 rows).'
			);
			return [];
		}
	} catch (error) {
		console.error('[GoogleSheets] Error in getTasksFromSheet operation:', error);
		return [];
	}
}
