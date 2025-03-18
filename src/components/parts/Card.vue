<template>
  <div :class="$style.wrap">
    <div :class="$style.img" :style="`background-image: url(images/${image});`"/>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'card',
  props: {
    image: {
      type: String,
    },
  },
}
</script>

<style lang="scss" module>
.wrap {
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
}
.img {
  padding-top: 65%;
  width: 100%;
  background-size: cover;
  background-position: center;
}
</style>