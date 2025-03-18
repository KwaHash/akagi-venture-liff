<template>
  <div :class="[$style.btn, $style[`${type}`], disabled ? $style.disabled : '']">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'button',
  props: {
    type: {
      type: String,
      default: 'bg',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" module>
.btn {
  padding: 8px 12px;
  border-radius: 6px;
  background-color: var(--yellow);
  color: #fff;
  font-size: 14px;
  text-align: center;
  font-weight: bold;

  &.bdr {
    background: #fff;
    color: var(--yellow);
    border: 1px solid var(--yellow);
  }

  &.disabled {
    background: var(--gray);
    opacity: .4;
    pointer-events: none;
  }
}
</style>
