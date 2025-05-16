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
				private_key: credentials.private_key?.replace(/\\n/g, '\n')
			},
			scopes: SHEETS_SCOPES
		});
		const authClient = await auth.getClient();
		return google.sheets({ version: 'v4', auth: authClient });
	} catch (error) {
		console.error('[GoogleSheets] API authentication failed:', error);
		return null;
	}
}

export async function appendToSheet(values: any[][]): Promise<boolean> {
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
			resource: { values }
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
