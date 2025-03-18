<template>
  <div>
    <basic-box>
      <p :class="$style.text">{{ text }}</p>
      <spacer :y="2"/>
      <btn @click="clicked">{{ btnText }}</btn>
    </basic-box>
  </div>
</template>

<script>
import Spacer from '../parts/Spacer.vue';
import BasicBox from '../parts/BasicBox.vue';
import Btn from '../parts/Btn.vue';
import cf from '../../mixins/commonFunctions.js';

export default {
  naem: 'get-concent',
  mixins: [cf],
  props: {
    text: {
      type: String,
    },
    btnText: {
      type: String,
      default: 'はい',
    },
  },
  components: {
    Spacer,
    BasicBox,
    Btn,
  },
  methods: {
    clicked() {
      this.$emit('clicked');
    },
  },
};
</script>

<style lang="scss" module>
.text {
  font-size: 14px;
}
</style>
