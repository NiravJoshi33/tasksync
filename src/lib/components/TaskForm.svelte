<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../routes/$types'; // Path to ActionData

	// Svelte 5 Props
	let { form: formProp }: { form?: ActionData } = $props();

	// Svelte 5 State
	let taskDate = $state('');
	let startTime = $state('');
	let endTime = $state('');
	let taskDescription = $state('');
	let taskType = $state('Planned');
	let taskStatus = $state('To Do');
	let taskComments = $state('');
	let submittedBy = $state('');

	let clientErrors = $state({
		taskDescription: '',
		submittedBy: ''
	});

	// Initialize date on mount and repopulate from formProp if it exists (e.g., after validation error)
	$effect(() => {
		if (typeof window !== 'undefined') {
			// Ensure onMount-like behavior for client-side only init
			taskDate = new Date().toISOString().split('T')[0];
		}
		if (formProp?.data) {
			taskDate = formProp.data.taskDate || new Date().toISOString().split('T')[0];
			startTime = formProp.data.startTime || '';
			endTime = formProp.data.endTime || '';
			taskDescription = formProp.data.taskDescription || '';
			taskType = formProp.data.taskType || 'Planned';
			taskStatus = formProp.data.taskStatus || 'To Do';
			taskComments = formProp.data.taskComments || '';
			submittedBy = formProp.data.submittedBy || '';
		}
	});

	function validateClientSide() {
		let isValid = true;
		clientErrors.taskDescription = '';
		// clientErrors.submittedBy = ''; // Example if it had client validation

		if (taskDescription.length > 0 && taskDescription.length < 10) {
			clientErrors.taskDescription = 'Task description must be at least 10 characters.';
			isValid = false;
		}
		return isValid;
	}

	// Removed unused validateForm and handleSubmit from previous version as enhance handles it
</script>

<form
	method="POST"
	action="?/logTask"
	use:enhance={() => {
		if (!validateClientSide()) {
			// Optionally return { cancel: true } if client-side validation is critical to stop submission
		}
		return async ({ result, update }) => {
			await update(); // This updates page store, which updates formProp
			if (result.type === 'success' && result.data?.success) {
				// Reset form fields
				taskDate = new Date().toISOString().split('T')[0];
				startTime = '';
				endTime = '';
				taskDescription = '';
				taskComments = '';
				submittedBy = '';
				// taskType and taskStatus could be reset to defaults if desired
				// taskType = 'Planned';
				// taskStatus = 'To Do';
				clientErrors.taskDescription = '';
				clientErrors.submittedBy = '';
			}
			// Error display is now primarily through formProp.errors in the template
		};
	}}
	class="space-y-6"
>
	<h2 class="mb-6 text-xl font-medium text-gray-800">Log Your Task</h2>

	<!-- Display server-side validation errors per field, accessed via formProp -->
	<div>
		<label for="taskDate" class="block text-sm font-medium text-gray-700">Date</label>
		<input
			type="date"
			id="taskDate"
			name="taskDate"
			bind:value={taskDate}
			required
			class:border-red-500={formProp?.errors?.taskDate}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		/>
		{#if formProp?.errors?.taskDate}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.taskDate}</p>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="startTime" class="block text-sm font-medium text-gray-700"
				>Start Time (Optional)</label
			>
			<input
				type="time"
				id="startTime"
				name="startTime"
				bind:value={startTime}
				class:border-red-500={formProp?.errors?.startTime}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			/>
			{#if formProp?.errors?.startTime}
				<p class="mt-1 text-xs text-red-600">{formProp.errors.startTime}</p>
			{/if}
		</div>
		<div>
			<label for="endTime" class="block text-sm font-medium text-gray-700"
				>End Time (Optional)</label
			>
			<input
				type="time"
				id="endTime"
				name="endTime"
				bind:value={endTime}
				class:border-red-500={formProp?.errors?.endTime}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			/>
			{#if formProp?.errors?.endTime}
				<p class="mt-1 text-xs text-red-600">{formProp.errors.endTime}</p>
			{/if}
		</div>
	</div>

	<div>
		<label for="taskDescription" class="block text-sm font-medium text-gray-700"
			>Task Description</label
		>
		<textarea
			id="taskDescription"
			name="taskDescription"
			rows="3"
			bind:value={taskDescription}
			required
			minlength="10"
			oninput={validateClientSide}
			class:border-red-500={clientErrors.taskDescription || formProp?.errors?.taskDescription}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Detailed description of the task (min 10 characters)"
		></textarea>
		{#if clientErrors.taskDescription && !formProp?.errors?.taskDescription}
			<p class="mt-1 text-xs text-red-600">{clientErrors.taskDescription}</p>
		{/if}
		{#if formProp?.errors?.taskDescription}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.taskDescription}</p>
		{/if}
	</div>

	<div>
		<label for="taskType" class="block text-sm font-medium text-gray-700">Task Type</label>
		<select
			id="taskType"
			name="taskType"
			bind:value={taskType}
			required
			class:border-red-500={formProp?.errors?.taskType}
			class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		>
			<option value="Planned">Planned</option>
			<option value="New/Ad-hoc">New/Ad-hoc</option>
		</select>
		{#if formProp?.errors?.taskType}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.taskType}</p>
		{/if}
	</div>

	<div>
		<label for="taskStatus" class="block text-sm font-medium text-gray-700">Status</label>
		<select
			id="taskStatus"
			name="taskStatus"
			bind:value={taskStatus}
			required
			class:border-red-500={formProp?.errors?.taskStatus}
			class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		>
			<option value="To Do">To Do</option>
			<option value="In Progress">In Progress</option>
			<option value="Completed">Completed</option>
			<option value="Blocked">Blocked</option>
			<option value="Deferred">Deferred</option>
		</select>
		{#if formProp?.errors?.taskStatus}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.taskStatus}</p>
		{/if}
	</div>

	<div>
		<label for="taskComments" class="block text-sm font-medium text-gray-700"
			>Comments/Updates</label
		>
		<textarea
			id="taskComments"
			name="taskComments"
			rows="2"
			bind:value={taskComments}
			class:border-red-500={formProp?.errors?.taskComments}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Any additional comments or updates (optional)"
		></textarea>
		{#if formProp?.errors?.taskComments}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.taskComments}</p>
		{/if}
	</div>

	<div>
		<label for="submittedBy" class="block text-sm font-medium text-gray-700"
			>Submitted By (Your Name)</label
		>
		<input
			type="text"
			id="submittedBy"
			name="submittedBy"
			bind:value={submittedBy}
			required
			class:border-red-500={clientErrors.submittedBy || formProp?.errors?.submittedBy}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Enter your name (for V1)"
		/>
		{#if clientErrors.submittedBy && !formProp?.errors?.submittedBy}
			<p class="mt-1 text-xs text-red-600">{clientErrors.submittedBy}</p>
		{/if}
		{#if formProp?.errors?.submittedBy}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.submittedBy}</p>
		{/if}
	</div>

	<div>
		<button
			type="submit"
			class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
		>
			Log Task
		</button>
	</div>
</form>

<style>
	.border-red-500 {
		border-color: #ef4444;
	}
</style>
