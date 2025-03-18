<template>
  <div :class="$style.number">
    <basic-box :title="'予約人数'">
      <div>
        <p :class="$style.label">
          <span v-if="flag.withKids">大人</span>
          <span v-else>大人・子供（小学生以上）</span>
        </p>
        <select
          :class="$style.select"
          name="adult" id="adult"
          @change="changeNum($event, 'adult')">
          <option :value="0">0名</option>
          <option
            v-for="n of max"
            :key="n"
            :value="n"
            :selected="n === adult">{{ n }}名</option>
        </select>
      </div>
      <div v-if="flag.withKids">
        <spacer :y="2"/>
        <p :class="$style.label">子供</p>
        <select
          :class="$style.select"
          name="kids" id="kids"
          @change="changeNum($event, 'kids')">
          <option :value="0">0名</option>
          <option
            v-for="n of kidsMax"
            :key="n"
            :value="n"
            :selected="n === kids">{{ n }}名</option>
        </select>
      </div>
      <div>
        <spacer :y="2"/>
        <p :class="$style.label">未就学児</p>
        <select
          :class="$style.select"
          name="preschooler" id="preschooler"
          @change="changeNum($event, 'preschooler')">
          <option :value="0">0名</option>
          <option
            v-for="n of 6"
            :key="n"
            :value="n"
            :selected="n === preschooler">{{ n }}名</option>
        </select>
        <p :class="$style.note">※未就学児のイスは持参お願いします</p>
      </div>
      <spacer :y="2"/>
      <btn
        :disabled="!sum"
        @click="sum ? changeStep(1) : ''">この人数で予約する</btn>
      <spacer :y="1"/>
      <btn
        :type="'bdr'"
        @click="changeStep(0)">戻る</btn>
    </basic-box>
  </div>
</template>

<script>
import Spacer from '../parts/Spacer.vue';
import Btn from '../parts/Btn.vue';
import BasicBox from '../parts/BasicBox.vue';

export default {
  name: 'select-number',
  props: {
    plan: {
      type: Object,
    },
    initadult: {
      type: Number,
    },
    initkids: {
      type: Number,
    },
  }, 
  components: {
    Spacer,
    Btn,
    BasicBox,
  },
  data() {
    return {
      adult: 0,
      kids: 0,
      preschooler: 0,
      flag: {
        withKids: false,
      },
    };
  },
  computed: {
    max() {
      return this.plan.availableNumber.max - this.kids;
    },
    kidsMax() {
      return this.plan.availableNumber.max - this.adult;
    },
    sum() {
      return Number(this.adult) + Number(this.kids);
    },
  },
  created() {
    this.adult = this.initadult;
    this.kids = this.initkids;
    if (!this.adult && !this.initkids) {
      this.adult = this.plan.availableNumber.min;
      this.sendvalue();
    }
    if (this.plan.prices.find((p) => p.type === 'kids')) this.flag.withKids = true;
  },
  methods: {
    changeNum(e, type) {
      this[type] = e.target.value;
      this.sendvalue();
    },

    changeStep(type) {
      if (type === 0) {
        this.adult = 0;
        this.kids = 0;
      }
      this.sendvalue();
      this.$emit('changeStep', type);
    },

    sendvalue() {
      this.$emit('edited', { type: 'number', adult: this.adult, kids: this.kids, preschooler: this.preschooler });
    },
  },
}
</script>

<style lang="scss" module>
.number {
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--gray);
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
  }
}
.label {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}
.select {
  font-size: 16px;
  width: 100%;
  height: 2.5em;
  border: 1px solid var(--gray);
  border-radius: 4px;
  outline: none;
  background-color: white;
  color: var(--font);
}
.note {
  font-size: 12px;
  margin-top: 4px;
}
</style>