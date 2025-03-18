<template>
  <div :class="$style.wrap">
    <basic-box v-if="flag.deleted">
      <p>予約をキャンセルしました。</p>
    </basic-box>
    <basic-box v-if="!flag.deleted">
      <p :class="$style.title">現在の予約</p>
      <ul :class="$style.list">
        <li
          v-for="item in items"
          :key="item.name">
          <p :class="$style.label">{{ item.label }}</p>
          <div :class="$style.value">
            <p v-if="item.name === 'date'">{{ formatTimestamp(detail.start_time, 'YYYY/MM/DD') }}</p>
            <p v-if="item.name === 'course'">{{ plan.label }}（{{ course.label }}）</p>
            <p v-if="item.name === 'num'">
              <span v-if="!num_kids">{{ detail.num_adult }}名</span>
              <span v-else>大人：{{ detail.num_adult }}名<br>子供：{{ detail.num_kids }}名</span>
            </p>
            <p v-else>{{ detail[item.name] }}</p>
          </div>
        </li>
      </ul>
      <p
        :class="$style.remark"
        v-if="!canBeCanceled">※キャンセルは４日前までとなります。</p>
      <div v-if="canBeCanceled">
        <spacer :y="3"/>
        <div
          :class="$style.cancel"
          v-if="!flag.confirm">
          <p @click="changeConfirmFlag(1)">詳細はこちら</p>
        </div>
        <div
          v-if="flag.confirm && !flag.error && !flag.loading"
          :class="$style.confirm">
          <p>ご予約をキャンセルします。よろしいですか？</p>
          <p :class="$style.remark">※キャンセルは４日前までとなります。</p>
          <p :class="$style.remark">※この操作は取り消せません。</p>
          <spacer :y="3"/>
          <div :class="$style.btnlist">
            <btn
              :class="$style.btn"
              @click="cancel">はい</btn>
            <btn
              :type="'bdr'"
              :class="$style.btn"
              @click="changeConfirmFlag(0)">いいえ</btn>
          </div>
        </div>
        <div v-if="flag.error">
          <p>処理中にエラーが発生しました。ページを閉じて再度やり直してください。</p>
        </div>
        <div v-if="flag.loading">
          <p>Loading...</p>
        </div>
      </div>
    </basic-box>
  </div>
</template>

<script>
import BasicBox from '../parts/BasicBox.vue';
import Btn from '../parts/Btn.vue';
import Spacer from '../parts/Spacer.vue';
import axios from '../../plugins/axios.js';
import cf from '../../mixins/commonFunctions.js';
import moment from 'moment';

export default {
  name: 'reservation-detail',
  mixins: [cf],
  props: {
    detail: {
      type: Object,
    },
    plans: {
      type: Object,
    },
  },
  components: {
    BasicBox,
    Btn,
    Spacer,
  },
  data() {
    return {
      flag :{
        confirm: false,
        deleted: false,
        error: false,
        loading: false,
      },
      items: [
        {
          name: 'date',
          label: '予約日'
        },
        {
          name: 'course',
          label: 'コース',
        },
        {
          name: 'num',
          label: '予約人数',
        },
        {
          name: 'linename',
          label: 'お名前',
        },
        {
          name: 'tel',
          label: '電話番号',
        }
      ],
    };
  },
  computed: {
    plan() {
      return this.plans.plans.find((p) => p.id === this.detail.plan_id);
    },
    course() {
      if (this.plan) {
        return this.plan.courses.find((c) => c.start === this.formatTimestamp(this.detail.start_time, 'HH:mm'));
      }
      return { label: '' };
    },
    canBeCanceled() {
      let flag = false;
      const today = moment(new Date()).format('YYYY-MM-DD');
      const limit = this.detail ? moment(this.detail.start_time).subtract(3, 'd').format('YYYY-MM-DD') : null;
      if (limit && limit > today) flag = true;
      return flag;
    },
  },
  methods: {
    changeConfirmFlag(flag) {
      this.flag.confirm = Boolean(flag);
    },
    async cancel() {
      this.flag.loading = true;
      const data = { id: this.detail.id }
      await axios({
        method: 'POST',
        url: '/v1/reservation/delete',
        data,
      })
        .then((response) => {
          const res = response.data;
          this.flag.deleted = res.deleted;
          this.$emit('update');
        })
        .catch((error) => {
          console.log(error);
          this.flag.error = true;
        })
        .finally(() => {
          this.flag.loading = false;
        })
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  font-size: 14px;
}
.title {
  font-weight: bold;
  margin-bottom: 12px;
}
.list {
  font-size: 14px;
  li {
    border-top: 1px solid #e2e2e2;
    padding: 12px 4px;
  }
}
.label {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
}
.cancel {
  font-size: 12px;
  display: flex;
  justify-content: center;
  p {
    text-decoration: underline;
  }
}
.confirm {
  font-size: 14px;
  text-align: center;
}
.remark {
  font-size: 12px;
  color: red;
  text-align: center;
}
.btnlist {
  display: flex;
  justify-content: space-between;
  .btn {
    display: block;
    width: 40%;
  }
}
</style>
