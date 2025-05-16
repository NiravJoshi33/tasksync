<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData } from '../../routes/$types';

	export let form: ActionData | undefined = undefined;

	let taskDate: string = '';
	let startTime: string = '';
	let endTime: string = '';
	let taskDescription: string = '';
	let taskType: string = 'Planned'; // Default value
	let taskStatus: string = 'To Do'; // Default value
	let taskComments: string = '';
	let submittedBy: string = ''; // Simple text field for V1

	// Reactive state for form handling, will be driven by SvelteKit's form action result
	// These are typically not needed directly with enhance if using page form object,
	// but can be useful for custom UX before page form data updates.
	// For this iteration, we rely on page.form provided by SvelteKit for messages.

	// Client-side validation errors (for immediate feedback)
	let clientErrors = {
		taskDescription: '',
		submittedBy: ''
	};

	onMount(() => {
		// Set initial date only on client to avoid SSR mismatch if server rendered a different date
		taskDate = new Date().toISOString().split('T')[0];
		// Repopulate form from server data if validation failed on initial load (e.g. page reload after fail)
		if (form?.data) {
			taskDate = form.data.taskDate || taskDate;
			startTime = form.data.startTime || '';
			endTime = form.data.endTime || '';
			taskDescription = form.data.taskDescription || taskDescription;
			taskType = form.data.taskType || taskType;
			taskStatus = form.data.taskStatus || taskStatus;
			taskComments = form.data.taskComments || taskComments;
			submittedBy = form.data.submittedBy || submittedBy;
		}
	});

	// Reactive update for when `form` prop changes after submission
	$: if (form?.data && form.errors) {
		// Only repopulate if there were errors
		taskDate = form.data.taskDate || taskDate;
		startTime = form.data.startTime || '';
		endTime = form.data.endTime || '';
		taskDescription = form.data.taskDescription || taskDescription;
		taskType = form.data.taskType || taskType;
		taskStatus = form.data.taskStatus || taskStatus;
		taskComments = form.data.taskComments || taskComments;
		submittedBy = form.data.submittedBy || submittedBy;
	}

	function validateClientSide() {
		let isValid = true;
		clientErrors.taskDescription = '';
		clientErrors.submittedBy = '';

		if (taskDescription.length > 0 && taskDescription.length < 10) {
			// Only validate if user started typing
			clientErrors.taskDescription = 'Task description must be at least 10 characters.';
			isValid = false;
		}
		// No client-side validation for submittedBy for now to keep it simple, rely on server.
		// HTML5 'required' attribute will handle empty check.
		return isValid;
	}

	// This will be called by SvelteKit's enhance before submission
	function beforeSubmit() {
		if (!validateClientSide()) {
			// Optionally prevent submission if client-side validation fails significantly,
			// though server-side validation is the authority.
			// For now, let client-side validation only show messages.
		}
		// isSubmitting state will be handled by use:enhance and page data
	}

	// After SvelteKit form action completes, this can handle UI updates.
	// The `form` prop from `+page.svelte` will carry success/error messages.
	// Resetting the form fields is handled in the `enhance` callback if successful.

	// Basic validation messages (can be made more sophisticated)
	let errors = {
		taskDescription: '',
		submittedBy: '' // Example for another required field if needed
	};

	function validateForm() {
		let isValid = true;
		errors.taskDescription = '';
		errors.submittedBy = '';

		if (taskDescription.length < 10) {
			errors.taskDescription = 'Task description must be at least 10 characters.';
			isValid = false;
		}
		if (!submittedBy.trim()) {
			// Basic check, PRD indicates 'Submitted By' is simple text field for V1.
			// If it were strictly required with validation, we'd handle it like description.
			// For now, let's assume it becomes required for this example.
			errors.submittedBy = 'Submitted By is required.';
			isValid = false;
		}
		// Add more validation rules as needed for other fields (e.g. date)
		return isValid;
	}

	async function handleSubmit() {
		// Implementation of handleSubmit function
	}
</script>

<!--
	The `form` prop will be passed down from +page.svelte.
	It contains data from the server after a form submission.
	export let data; // from +page.server.ts load function
	export let form; // from +page.server.ts actions
-->

<form
	method="POST"
	use:enhance={() => {
		beforeSubmit();
		return async ({ result, update }) => {
			// result.type can be 'success', 'failure', 'error'
			await update(); // This updates the page store, including `export let form`
			if (result.type === 'success' && result.data?.success) {
				// Reset form fields on successful submission
				taskDescription = '';
				taskComments = '';
				submittedBy = ''; // Also reset if desired
				taskDate = new Date().toISOString().split('T')[0]; // Reset date
				startTime = '';
				endTime = '';
				clientErrors.taskDescription = ''; // Clear client-side errors
				clientErrors.submittedBy = '';
			}
			// Error messages from `result.data.errors` will be displayed via the `form` prop
		};
	}}
	class="space-y-6"
>
	<h2 class="mb-6 text-xl font-medium text-gray-800">Log Your Task</h2>

	<!-- Success/Error messages will be handled by data passed from +page.svelte via `form` prop -->
	<!-- Example: {#if form?.successMessage} ... {/if} -->
	<!-- Example: {#if form?.errorMessage} ... {/if} -->
	<!-- Example: {#if form?.errors?.fieldName} ... {/if} -->

	<div>
		<label for="taskDate" class="block text-sm font-medium text-gray-700">Date</label>
		<input
			type="date"
			id="taskDate"
			name="taskDate"
			bind:value={taskDate}
			required
			class:border-red-500={form?.errors?.taskDate}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		/>
		{#if form?.errors?.taskDate}
			<p class="mt-1 text-xs text-red-600">{form.errors.taskDate}</p>
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
				class:border-red-500={form?.errors?.startTime}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			/>
			{#if form?.errors?.startTime}
				<p class="mt-1 text-xs text-red-600">{form.errors.startTime}</p>
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
				class:border-red-500={form?.errors?.endTime}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			/>
			{#if form?.errors?.endTime}
				<p class="mt-1 text-xs text-red-600">{form.errors.endTime}</p>
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
			on:input={validateClientSide}
			class:border-red-500={clientErrors.taskDescription || form?.errors?.taskDescription}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Detailed description of the task (min 10 characters)"
		></textarea>
		{#if clientErrors.taskDescription && !form?.errors?.taskDescription}
			<p class="mt-1 text-xs text-red-600">{clientErrors.taskDescription}</p>
		{/if}
		{#if form?.errors?.taskDescription}
			<p class="mt-1 text-xs text-red-600">{form.errors.taskDescription}</p>
		{/if}
	</div>

	<div>
		<label for="taskType" class="block text-sm font-medium text-gray-700">Task Type</label>
		<select
			id="taskType"
			name="taskType"
			bind:value={taskType}
			required
			class:border-red-500={form?.errors?.taskType}
			class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		>
			<option value="Planned">Planned</option>
			<option value="New/Ad-hoc">New/Ad-hoc</option>
		</select>
		{#if form?.errors?.taskType}
			<p class="mt-1 text-xs text-red-600">{form.errors.taskType}</p>
		{/if}
	</div>

	<div>
		<label for="taskStatus" class="block text-sm font-medium text-gray-700">Status</label>
		<select
			id="taskStatus"
			name="taskStatus"
			bind:value={taskStatus}
			required
			class:border-red-500={form?.errors?.taskStatus}
			class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		>
			<option value="To Do">To Do</option>
			<option value="In Progress">In Progress</option>
			<option value="Completed">Completed</option>
			<option value="Blocked">Blocked</option>
			<option value="Deferred">Deferred</option>
		</select>
		{#if form?.errors?.taskStatus}
			<p class="mt-1 text-xs text-red-600">{form.errors.taskStatus}</p>
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
			class:border-red-500={form?.errors?.taskComments}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Any additional comments or updates (optional)"
		></textarea>
		{#if form?.errors?.taskComments}
			<p class="mt-1 text-xs text-red-600">{form.errors.taskComments}</p>
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
			class:border-red-500={clientErrors.submittedBy || form?.errors?.submittedBy}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
			placeholder="Enter your name (for V1)"
		/>
		{#if clientErrors.submittedBy && !form?.errors?.submittedBy}
			<p class="mt-1 text-xs text-red-600">{clientErrors.submittedBy}</p>
		{/if}
		{#if form?.errors?.submittedBy}
			<p class="mt-1 text-xs text-red-600">{form.errors.submittedBy}</p>
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
	/* Scoped styles for TaskForm component if needed */
	/* Using Tailwind utility classes primarily */
	.border-red-500 {
		border-color: #ef4444; /* Tailwind's red-500 */
	}
</style>
