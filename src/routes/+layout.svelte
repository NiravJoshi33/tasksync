<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<nav class="bg-gray-800 p-4">
	<ul class="flex space-x-4">
		<li><a href="/" class="text-white hover:text-gray-300">Log Task</a></li>
		<li><a href="/tasks" class="text-white hover:text-gray-300">View Tasks</a></li>
	</ul>
</nav>

{@render children()}
