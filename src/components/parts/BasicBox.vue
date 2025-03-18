<template>
  <div :class="$style.box">
    <p
      v-if="title"
      :class="$style.title">{{ title }}</p>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'basic-box',
  props: {
    title: {
      type: String,
    }
  }
}
</script>

<style lang="scss" module>
.box {
  background-color: #fff;
  padding: 16px;
  border-radius: 6px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}
.title {
  font-weight: bold;
  margin-bottom: 12px;
}
</style>