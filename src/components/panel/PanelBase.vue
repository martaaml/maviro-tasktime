<template>
  <div class="panel-base">
    <Header />

    <div class="panel-body">
      <aside class="sidebar">
        <slot name="sidebar"></slot>
      </aside>

      <main class="panel-content">
        <slot></slot>
      </main>
    </div>

  </div>
</template>

<script setup>
import Header from "@/components/layout/header/Header.vue";
</script>

<style scoped>
.panel-body {
  display: flex;
  height: calc(70vh - 70px);
}

.sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  padding: 1rem;
}

.panel-content {
  flex: 1;
  padding: 2rem;
  background-color: #f9fafb;
}

.button-panel {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.button-panel:hover {
  transform: scale(1.05);
  background-color: #1e40af;
}
</style>
