<template>
  <div class="appRoot">
    <router-view class="view" />
  </div>
</template>

<style>
/* IMPORTANT: App root fills the PHONE (#app), not the browser viewport */
.appRoot {
  width: 100%;
  height: 100%;
  background: #0b0b0c;
  overflow: hidden;
}

/* Router view must also fill the phone */
.view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: block;
}
</style>
