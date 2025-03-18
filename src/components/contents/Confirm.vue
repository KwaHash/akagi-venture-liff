<template>
  <div>
    <basic-box :title="'予約内容確認'">
      <ul :class="$style.list">
        <li
          v-for="item in items"
          :key="item.key">
          <p :class="$style.label">{{ item.label }}</p>
          <div :class="$style.value">
            <p v-if="!['date', 'plan', 'number'].includes(item.key)">{{ reservationData[item.key] }}</p>
            <p v-else-if="item.key === 'date'">{{ formatTimestamp(date.day, 'YYYY年MM月DD日') }}</p>
            <p v-else-if="item.key === 'plan'">{{ plan.label }}（{{ course.label }}）</p>
            <div v-else-if="item.key === 'number'">
              <p>
                <span v-if="withKids">大人</span>
                <span v-else>大人・子供（小学生以上）</span>
                <span>：{{ reservationData.num_adult }}名</span>
              </p>
              <p v-if="withKids">子供：{{ reservationData.num_kids }}名</p>
              <p>未就学児：{{ reservationData.num_preschooler }}名</p>
            </div>
          </div>
        </li>
      </ul>
      <spacer :y="2"/>
      <div :class="$style.remark">
        <p>予約当日の風速が５ｍ程度以上の場合、危険を伴うためタープ（屋根）の設営ができない場合がございますので予めご了承ください。</p>
        <div :class="$style.checkbox">
          <input
            type="checkbox"
            id="remark"
            name="remark"
            v-model="flag.remarkChecked">
          <label for="remark">了承しました</label>
        </div>
      </div>
      <spacer :y="2"/>
      <btn
        @click="submitReservation"
        :disabled="!flag.remarkChecked">予約を確定する</btn>
      <spacer :y="1"/>
      <btn
        :type="'bdr'"
        @click="changeStep(0)">戻る</btn>
    </basic-box>
  </div>
</template>

<script>
import cf from '../../mixins/commonFunctions.js';
import Spacer from '../parts/Spacer.vue';
import Btn from '../parts/Btn.vue';
import BasicBox from '../parts/BasicBox.vue';

export default {
  name: 'confirm',
  mixins: [cf],
  props: {
    reservationData: {
      type: Object,
    },
    plan: {
      type: Object,
    },
    date: {
      type: Object,
    },
  },
  components: {
    Spacer,
    Btn,
    BasicBox,
  },
  data() {
    return {
      flag: {
        remarkChecked: false,
      },
      items: [
        {
          label: 'お名前',
          key: 'linename',
        },
        {
          label: '電話番号',
          key: 'tel',
        },
        {
          label: '予約日時',
          key: 'date',
        },
        {
          label: 'プラン',
          key: 'plan',
        },
        {
          label: '予約人数',
          key: 'number',
          detail: [
            {
              label: '大人',
              key: 'adult',
            },
            {
              label: '子供',
              key: 'kids',
            },
          ],
        },
      ],
    };
  },
  computed: {
    withKids() {
      return Boolean(this.plan.prices.find((p) => p.type === 'kids'));
    },
    course() {
      return this.plan.courses.find((c) => c.id === this.reservationData.courseId);
    },
  },
  methods: {
    changeStep(type) {
      this.$emit('changeStep', type);
    },
    submitReservation() {
      if (!this.flag.remarkChecked) return;
      this.$emit('submitReservation');
    },
  },
}
</script>

<style lang="scss" module>
.list {
  li {
    border-top: 1px solid #eee;
    padding: 12px 6px;
    font-size: 14px;
  }
}
.label {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 8px;
}
.value {
  padding: 0 6px;
}
.remark {
  font-size: 12px;
  padding: 12px;
  background-color: rgba(rgb(212, 71, 90), .1);
  border-radius: 8px;
  .checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
  }
}
</style>
