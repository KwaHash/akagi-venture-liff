<template>
  <div>
    <basic-box :title="'予約日時の選択'">
      <p v-if="!flag.checked">Loading...</p>
      <p v-else-if="flag.error" :class="$style.error">処理中にエラーが発生しました。ページを閉じて再度やり直してください。</p>
      <div v-else>
        <DatePicker
          :is-expanded="true"
          v-model="date"
          :available-dates="availableDates"/>
        <spacer :y="2"/>
        <p
          v-if="date"
          :class="$style.date">{{ formatTimestamp(date, 'YYYY年MM月DD日') }}</p>
        <btn
          :disabled="!Boolean(date)"
          @click="date ? changeStep(1) : ''">この日時で予約する</btn>
        <spacer :y="1"/>
        <btn
          :type="'bdr'"
          @click="changeStep(0)">戻る</btn>
      </div>
    </basic-box>
  </div>
</template>

<script>
import Spacer from '../parts/Spacer.vue';
import Btn from '../parts/Btn.vue';
import BasicBox from '../parts/BasicBox.vue';
import { DatePicker } from 'v-calendar';
import moment from 'moment';
import axios from '../../plugins/axios';
import cf from '../../mixins/commonFunctions.js';

export default {
  name: 'select-date', 
  mixins: [cf],
  props: {
    initDate: {
      type: Date,
    },
    shopId: {
      type: Number,
    },
  },
  components: {
    DatePicker,
    Spacer,
    Btn,
    BasicBox,
  },
  data() {
    return {
      flag: {
        checked: false,
        error: false,
      },
      date: null,
      availableDates: [],
      error: null,
    };
  },
  created() {
    this.date = this.initDate;
    this.checkAvailableDate();
  },
  computed: {},
  watch: {
    date() {
      this.updateParent();
    },
  },
  methods: {
    updateParent() {
      this.$emit('edited', { type: 'date', date: this.date });
    },
    changeStep(type) {
      this.$emit('changeStep', type);
    },

    checkAvailableDate() {
      this.flag.checked = false;
      axios({
        methods: 'GET',
        url: '/v1/reservation/get/empty',
        params: { shop_id: this.shopId }
      })
        .then((response) => {
          const res = response.data;
          this.availableDates = [];
          res.empty.forEach((e) => {
            this.availableDates.push({
              start: new Date(e),
              end: new Date(e),
            });
          });
          this.flag.checked = true;
        })
        .catch((error) => {
          console.log(error);
          this.flag.error = true;
          this.flag.checked = true;
        });
    },
  },
}
</script>

<style lang="scss" module>
.date {
  margin-bottom: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
.error {
  font-size: 14px;
}
</style>