<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <div class="greetings">
    <div class="left">
      <h3>{{ msg }}</h3>
      <p>Welcome to my world</p>
    </div>
    <div class="nav">
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
      &nbsp;
      <RouterLink :to="{ name: 'bim' }">BIM</RouterLink>
      &nbsp;
      <RouterLink :to="{ name: 'cineroom' }">CineRoom</RouterLink>
    </div>
    <div class="right"></div>
  </div>
</template>

<style scoped>
.greetings {
  position: absolute;
  z-index: 2;
  width: 100%;
  display: grid;
  grid-template-columns: auto auto auto;
  color: #ffffe0;
  overflow: hidden;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
}
.left {
  width: 200px;
}
.right {
  width: 200px;
}
.nav {
  flex: 1;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  color: white;
}
a {
  color: #ffcfb0;
  font-size: 16px;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
a,
button,
input,
select {
  pointer-events: auto;
}
</style>
