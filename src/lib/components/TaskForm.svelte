<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData } from '../../routes/$types';
	import { driver } from 'driver.js';
	import 'driver.js/dist/driver.css';

	const driverObj = driver({
		showProgress: true,
		steps: [
			{
				element: 'form',
				popover: {
					title: 'Task Form',
					description: 'Add task related details in this form',
					side: 'right'
				}
			},
			{
				element: 'button',
				popover: {
					title: 'Log Task',
					description: 'Click on this button to log the task',
					side: 'bottom'
				}
			}
		]
	});

	onMount(() => {
		if (typeof window !== 'undefined') {
			const hasVisited = localStorage.getItem('hasVisitedTaskForm');
			if (!hasVisited) {
				setTimeout(() => {
					driverObj.drive();
				}, 500);
				localStorage.setItem('hasVisitedTaskForm', 'true');
			}
		}
	});

	let { form: formProp }: { form?: ActionData } = $props();

	const projectOptions = ['SMBmarket', 'BeMySearch', 'Misc'];

	let taskDate = $state('');
	let startTime = $state('');
	let endTime = $state('');
	let taskDescription = $state('');
	let taskType = $state('Planned');
	let taskStatus = $state('To Do');
	let taskComments = $state('');
	let submittedBy = $state('');
	let project = $state('');

	let clientErrors = $state({
		taskDescription: '',
		submittedBy: ''
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
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
			project = formProp.data.project || '';
		}
	});

	function validateClientSide() {
		let isValid = true;
		clientErrors.taskDescription = '';

		if (taskDescription.length > 0 && taskDescription.length < 10) {
			clientErrors.taskDescription = 'Task description must be at least 10 characters.';
			isValid = false;
		}
		return isValid;
	}
</script>

<form
	method="POST"
	action="?/logTask"
	use:enhance={() => {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success' && result.data?.success) {
				// Reset form fields
				taskDate = new Date().toISOString().split('T')[0];
				startTime = '';
				endTime = '';
				taskDescription = '';
				taskComments = '';
				submittedBy = '';
				clientErrors.taskDescription = '';
				clientErrors.submittedBy = '';
				project = '';
			}
		};
	}}
	class="space-y-8"
>
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
		<label for="project" class="block text-sm font-medium text-gray-700">Project</label>
		<select
			id="project"
			name="project"
			bind:value={project}
			required
			class:border-red-500={formProp?.errors?.project}
			class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
		>
			{#each projectOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
		{#if formProp?.errors?.project}
			<p class="mt-1 text-xs text-red-600">{formProp.errors.project}</p>
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
