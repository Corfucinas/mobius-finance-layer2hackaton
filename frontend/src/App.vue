<template>
  <div id="app" onselectstart="return false;">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
@import './assets/css/font.css';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
::-webkit-scrollbar {
	width: 5px;
}
::-webkit-scrollbar-track {
	background-color: #f8f8f8;
}
::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.2); 
}
</style>
