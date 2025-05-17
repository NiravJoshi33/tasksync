<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { tasks } = data;
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-800">Existing Tasks</h1>

	{#if tasks && tasks.length > 0}
		<div class="overflow-x-auto rounded-lg bg-white shadow-md">
			<table class="min-w-full table-auto">
				<thead class="border-b border-gray-200 bg-gray-100">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Date</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Time</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Description</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Project</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Type</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Status</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Submitted By</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase"
							>Comments</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each tasks as task (task.id)}
						<tr class="transition-colors duration-150 hover:bg-gray-50">
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{task.taskDate}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
								{task.startTime} - {task.endTime}
							</td>
							<td class="px-6 py-4 text-sm text-gray-700">{task.taskDescription}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{task.project}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{task.taskType}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{task.taskStatus}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{task.submittedBy}</td>
							<td class="px-6 py-4 text-sm text-gray-700">{task.taskComments || 'N/A'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-gray-600">No tasks found. Add some tasks to see them here!</p>
	{/if}
</div>

<style>
	/* You can add any page-specific styles here if needed */
	/* Tailwind CSS classes are used for styling directly in the markup */
</style>
