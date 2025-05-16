<script lang="ts">
	import TaskForm from '$lib/components/TaskForm.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-xl">
		<div>
			<h1 class="mb-8 text-center text-3xl font-bold text-gray-900">TaskSync: Daily Task Logger</h1>
		</div>

		{#if form?.successMessage}
			<div class="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700" role="alert">
				<span class="font-medium">Success!</span>
				{form.successMessage}
			</div>
		{/if}

		{#if form?.errorMessage && !form?.successMessage}
			<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
				<span class="font-medium">Error!</span>
				{form.errorMessage}
				{#if form?.errors}
					<ul class="mt-1.5 ml-4 list-inside list-disc">
						{#each Object.entries((form as ActionData)?.errors || {}) as [field, error]}
							{#if error}<li>{error}</li>{/if}
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		<TaskForm {form} />
	</div>
</div>
