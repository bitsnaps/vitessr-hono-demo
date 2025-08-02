<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
	<div>
		<h1>Home</h1>
		<h1>A small state test for rehydration: {{ count }}</h1>
		<button @click="count++">Count++</button>
		<nav>
			<RouterLink to="/">Home</RouterLink> |
			<RouterLink to="/about">About</RouterLink>
		</nav>		
	</div>
</template>
