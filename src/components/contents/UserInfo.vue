<template>
  <div>
    <basic-box :title="'お客様情報の確認・入力'">
      <ul :class="$style.form">
        <li>
          <p :class="$style.label">お名前</p>
          <p :class="$style.remark">本名をご入力ください。</p>
          <div :class="$style.input">
            <input
              type="text"
              id="name"
              v-model="name">
          </div>
        </li>
        <li>
          <p :class="$style.label">電話番号</p>
          <p :class="$style.remark">半角数字、ハイフンなしでご入力ください。</p>
          <div :class="$style.input">
            <input
              type="text"
              id="tel"
              v-model="tel">
          </div>
        </li>
      </ul>
      <spacer :y="2"/>
      <btn
        :disabled="!submitFlag"
        @click="submitFlag ? changeStep() : ''">予約に進む</btn>
    </basic-box>
  </div>
</template>

<script>
import Spacer from '../parts/Spacer.vue';
import Btn from '../parts/Btn.vue';
import BasicBox from '../parts/BasicBox.vue';

export default {
  name: 'user-info', 
  props: {
    initname: {
      type: String,
    },
    inittel: {
      type: String,
    },
  },
  components: {
    Spacer,
    Btn,
    BasicBox,
  },
  data() {
    return {
      name: null,
      tel: null,
    };
  },
  created() {
    this.name = this.initname;
    this.tel = this.inittel;
  },
  computed: {
    submitFlag() {
      return this.name && this.isValidTel;
    },
    isValidTel() {
      return this.tel && this.tel.match(/^[0-9]+$/);
    },
  },
  watch: {
    name() {
      this.updateParent();
    },
    tel() {
      this.updateParent();
    },
  },
  methods: {
    updateParent() {
      this.$emit('edited', { type: 'user', userData: { name: this.name, tel: this.tel } });
    },
    changeStep() {
      this.$emit('changeStep', 1);
    },
  },
}
</script>

<style lang="scss" module>
.form {
  li {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
}
.label {
  font-size: 14px;
  font-weight: bold;
}
.remark {
  font-size: 11px;
  margin: 2px 0;
  padding-left: 1em;
  position: relative;
  &::before {
    content: '※';
    position: absolute;
    top: 0;
    left: 0;
  }
}
.input {
  position: relative;
  input {
    font-size: 16px;
    width: 100%;
    padding: 8px;
    border: 1px solid var(--gray);
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
  }
}
</style>