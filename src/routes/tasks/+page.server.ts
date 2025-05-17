import type { PageServerLoad } from './$types';
import { getTasksFromSheet } from '$lib/server/googleSheets';

export const load: PageServerLoad = async () => {
	const tasksFromSheet = await getTasksFromSheet();

	// Transform the data from SheetTask structure to the structure expected by +page.svelte
	const formattedTasks = tasksFromSheet.map((task) => ({
		id: task.id,
		taskDate: task.date, // Map from 'date' in SheetTask
		startTime: task.startTime,
		endTime: task.endTime,
		taskDescription: task.plannedTasksNotes, // Map from 'plannedTasksNotes'
		project: task.projectProd, // Map from 'projectProd'
		taskType: task.type, // Map from 'type'
		taskStatus: task.status, // 'status' is used directly for 'taskStatus' in the frontend
		submittedBy: 'N/A', // 'submittedBy' is not in the sheet, provide a default
		taskComments: task.issues // Map from 'issues'
	}));

	return {
		tasks: formattedTasks
	};
};
