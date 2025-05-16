<script lang="ts">
	// Later, we will import the TaskForm component here
	import TaskForm from '$lib/components/TaskForm.svelte';
	import type { ActionData } from './$types'; // Import ActionData for typing `form`

	export let form: ActionData; // This will be populated by SvelteKit from the server action
</script>

<div class="flex min-h-screen flex-col justify-center bg-gray-100 py-6 sm:py-12">
	<div class="relative py-3 sm:mx-auto sm:max-w-xl">
		<div
			class="to-light-blue-500 absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-cyan-400 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"
		></div>
		<div class="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
			<div class="mx-auto max-w-md">
				<div>
					<h1 class="mb-8 text-center text-2xl font-semibold">TaskSync: Daily Task Logger</h1>
				</div>

				{#if form?.successMessage}
					<div
						class="mb-4 rounded-lg bg-green-100 p-4 text-sm text-green-700 dark:bg-green-200 dark:text-green-800"
						role="alert"
					>
						<span class="font-medium">Success!</span>
						{form.successMessage}
					</div>
				{/if}

				{#if form?.errorMessage && !form?.successMessage}
					<div
						class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-200 dark:text-red-800"
						role="alert"
					>
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
	</div>
</div>

<style lang="postcss">
	/* If specific styles for this page are needed, they go here */
	/* Using Tailwind utility classes primarily */
</style>
