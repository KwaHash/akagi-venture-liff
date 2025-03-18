<template>
  <div>
    <h1 :class="$style.title">{{ rsvType === 'gwBbq' ? 'PREMIUM BEER GARDEN' : 'bacon' }} 予約フォーム</h1>
    <Spacer :y="2"/>
    <div v-if="!flag.login.checked || flag.loading">Loading...</div>

    <div v-else-if="flag.login.checked && flag.login.isLogin">
      <!-- 特別対応 -->
      <div v-if="rsvType === 'gwBbq'">
        <GwReservation
          :user="user"
          @update="getLineUser"
          ref="gwReservation" />
      </div>

      <!-- 特別対応（単発イベント） -->
      <div v-else-if="rsvType === 'irregular'">
        <IrregularReservation
          :user="user"
          :planId="1"
          @update="getLineUser"
          ref="irregularReservation"/>
      </div>

      <!-- 通常予約 -->
      <div v-else-if="rsvType === 'bacon'">
        <div v-if="flag.disabledCancel">
          <basic-box><p :class="$style.font_sm">３日以内に予約があるため新規予約をお取りすることができません。</p></basic-box>
        </div>
        <div v-else-if="userReservations && !flag.cancelBeforeRsv && !flag.isAdminNewRsv">
          <GetConcent
            v-if="!flag.isAdmin"
            :text="'新規予約確定時、現在の予約はキャンセルされますがよろしいですか。'"
            v-on:clicked="flag.cancelBeforeRsv = true"/>
          <Spacer v-if="!flag.isAdmin" :y="2"/>
          <GetConcent
            v-if="flag.isAdmin"
            :text="'複数予約を行う場合はこちらをクリックしてください'"
            :btnText="'予約する'"
            v-on:clicked="flag.isAdminNewRsv = true"/>
          <Spacer :y="2"/>
          <!-- 予約詳細 -->
          <div
            v-if="step === 1"
            v-for="(rsv, i) in userReservations"
            :key="rsv.id">
            <Spacer v-if="i !== 0" :y="2"/>
            <ReservationDetail
              v-if="(!flag.isAdmin && i === 0) || flag.isAdmin"
              :detail="rsv"
              :plans="baconData"
              @update="getLineUser" />
          </div>
        </div>
        <div
          v-else-if="!flag.registed && !flag.error && !flag.full">
          <UserInfo
            v-if="step === 1"
            :initname="reservationData.linename"
            :inittel="reservationData.tel"
            v-on:edited="updateInfo"
            v-on:changeStep="changeStep"/>
          <SelectDate
            v-if="step === 2"
            :shopId="shop.id"
            :initDate="date.day"
            v-on:edited="updateInfo"
            v-on:changeStep="changeStep"/>
          <SelectPlan
            v-if="step === 3"
            :shopId="shop.id"
            :plans="baconData.plans"
            :rentalItems="baconData.rentalItems"
            :date="date.day"
            v-on:edited="updateInfo"
            v-on:changeStep="changeStep"
            v-on:initDate="date.day = null"/>
          <SelectNumber
            v-if="step === 4"
            :initadult="reservationData.num_adult"
            :initkids="reservationData.num_kids"
            :plan="selectedPlan"
            v-on:edited="updateInfo"
            v-on:changeStep="changeStep"/>
          <Confirm
            v-if="step === 5"
            :reservationData="reservationData"
            :date="date"
            :plan="selectedPlan"
            :hasReservation="userReservations && userReservations.length"
            v-on:changeStep="changeStep"
            v-on:submitReservation="submitReservation"/>
        </div>
        <div
          :class="$style.nonReservation"
          v-if="!userReservations && step === 1">
          <spacer :y="2"/>
          <basic-box>
            <p>現在、ご予約はありません</p>
            <spacer :y="1"/>
            <p>プランは<a :href="`${baseUrls[envName]}/?menu=1`">こちら</a>よりご確認いただけます。</p>
          </basic-box>
        </div>
        <div v-else-if="flag.error">
          <basic-box>
            <p>処理中にエラーが発生しました。ページを閉じて再度やり直してください。</p>
          </basic-box>
        </div>
        <div v-else-if="flag.full">
          <basic-box>
            <p>枠が埋まってしまったため予約をお取りすることができませんでした。</p>
            <spacer :y="2"/>
            <btn @click="init">はじめからやり直す</btn>
          </basic-box>
        </div>
        <div v-else-if="flag.registed">
          <basic-box>
            <p>予約が完了しました。</p>
          </basic-box>
        </div>
      </div>

      <div v-else>
        <basic-box>
          <div>予約したいイベント・店舗を選択してください。</div>
          <spacer :y="2"/>
          <ul :class="$style.btnlist">
            <li><btn @click="rsvType = 'bacon'">bacon</btn></li>
          </ul>
        </basic-box>
      </div>
    </div>

    <!-- LINE以外からのアクセス -->
    <div v-else>
      LINEからアクセスしてください。
    </div>
  </div>
</template>

<script>
import liff from "@line/liff";
import { cloneDeep } from 'lodash';
import moment from 'moment';
import axios from './plugins/axios';
import Spacer from './components/parts/Spacer.vue';
import Btn from './components/parts/Btn.vue';
import BasicBox from './components/parts/BasicBox.vue';
import GwReservation from './components/contents/GwReservation.vue';
import IrregularReservation from './components/contents/IrregularReservation.vue';
import UserInfo from './components/contents/UserInfo.vue';
import SelectDate from './components/contents/SelectDate.vue';
import SelectPlan from './components/contents/SelectPlan.vue';
import SelectNumber from './components/contents/SelectNumber.vue';
import Confirm from './components/contents/Confirm.vue';
import GetConcent from './components/contents/GetConcent.vue';
import ReservationDetail from './components/contents/ReservationDetail.vue';
import cf from './mixins/commonFunctions';

export default {
  name: 'app',
  mixins: [cf],
  components: {
    Spacer,
    Btn,
    GwReservation,
    IrregularReservation,
    UserInfo,
    SelectDate,
    SelectPlan,
    SelectNumber,
    Confirm,
    GetConcent,
    BasicBox,
    ReservationDetail,
  },
  data() {
    return {
      flag: {
        registed: false, // 予約完了
        error: false, // 登録時エラー
        full: false, // 予約いっぱいだった場合
        disabledCancel: false,
        lineLogin: false,
        loading: false,
        cancelBeforeRsv: false, // すでに予約がある場合の元の予約破棄の承諾
        isAdminNewRsv: false, // Adminが複数予約を取る場合に利用
        login: {
          isLogin: false,
          checked: false,
        },
        isAdmin: false,
      },
      envName: 'production',
      baseUrls: {
        production: 'https://akagi-venture.jp',
        develop: 'https://dev.akagi-venture.jp',
        local: 'http://localhost:8080',
      },
      rsvType: null,
      baconData: null,
      u_id: null,
      user: null,
      userReservations: null,
      reservationData: {
        linename: null,
        tel: null,
        plan_id: null,
        num_adult: 0,
        num_kids: 0,
        num_preschooler: 0,
        line_user_id: null,
        courseId: null,
      },
      date: {
        day: null,
        start: null,
        end: null,
      },
      zeroInitKey: ['num_adult', 'num_kids'],
      step: 1,
      linename: null,
      shops: [],
    };
  },
  mounted() {
    // クエリから予約のタイプ判定（特別対応）
    // if (location.search.includes('gwBbq')) this.rsvType = 'gwBbq'
    // if (location.search.includes('irregular')) this.rsvType = 'irregular'
    // if (location.search.includes('bacon')) this.rsvType = 'bacon'
    this.rsvType = 'bacon'

    const ENV = cf.getEnvironment();
    this.envName = ENV.name;
    let LIFF_ID;
    switch(ENV.name) {
      case 'develop': LIFF_ID = import.meta.env.VITE_DEV_LIFF_ID; break;
      case 'production': LIFF_ID = import.meta.env.VITE_PROD_LIFF_ID; break;
      default: LIFF_ID = import.meta.env.VITE_LIFF_ID; break;
    }
    liff
      .init({
        liffId: LIFF_ID,
      })
      .then(() => {
        this.flag.login.isLogin = liff.isLoggedIn();
        // lineから
        if (this.flag.login.isLogin) {
          const idToken = liff.getDecodedIDToken();
          this.linename = idToken.name;
          this.reservationData.linename = this.linename;
          this.u_id = idToken.sub;
          this.getLineUser();
        } else if (!['develop', 'production'].includes(ENV.name)) {
          // LIFF以外のアクセスlocalテスト用
          this.flag.login.isLogin = true;
          this.linename = ''
          this.reservationData.linename = this.linename;
          this.u_id = import.meta.env.VITE_APP_LOCALUID;
          this.getLineUser();
        } else {
          this.flag.login.checked = true;
        }
      })
      .catch((e) => {
        console.log(e);
        this.flag.checked = true;
      });
  },
  created() {
    this.getPlans();
    this.getShops();
  },
  computed: {
    selectedPlan() {
      return this.baconData.plans.find((r) => r.id === this.reservationData.plan_id);
    },
    shop() {
      return this.shops.find((r) => r.name === this.rsvType)
    },
  },
  methods: {
    getPlans() {
      axios({
        method: 'GET',
        url: '/v1/connection/master',
      })
        .then((response) => {
          this.baconData = response.data.master.bacon;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        });
    },

    getShops() {
      axios({
        method: 'GET',
        url: '/v1/shop/get/list',
      })
        .then((response) => {
          const res = response.data;
          this.shops = res.list.data;
        })
        .catch((error) => {
          this.flag.error = true;
          if (error.response) console.log(error.response.data);
          else console.log(error);
        })
    },

    getLineUser(type) {
      this.userReservation = null;
      const id = this.u_id;
      const params = {
        u_id: id,
        withReservations: 1,
        isFuture: 1,
      };
      axios({
        method: 'GET',
        url: '/v1/lineUser/get/detail',
        params,
      })
      .then((response) => {
        const res = response.data;
        this.user = res.detail;
        this.reservationData.line_user_id = res.detail.id;
        if (res.detail.reservation.length) {
          this.userReservations = res.detail.reservation
          const rsvdt = moment(this.userReservations[0].start_time).subtract(3, 'day').format('YYYY-MM-DD')
          const today = moment(new Date()).format('YYYY-MM-DD')
          if (today > rsvdt && !res.detail.admin.length) this.flag.disabledCancel = true;
        }
        if (res.detail && res.detail.admin.length) this.flag.isAdmin = true;
        if (type === 'gwReservation') this.$refs.gwReservation.init(this.user)
        if (type === 'irregularReservation') this.$refs.irregularReservation.init(this.user)
        this.flag.login.checked = true;
      })
      .catch((error) => {
        console.log(error);
        this.flag.error = true;
        this.flag.login.checked = true;
      });
    },

    init() {
      this.step = 1;
      // name, u_id, tel 以外をinit( 0 or null にする )
      Object.keys(this.reservationData).forEach((k) => {
        if (!['linename', 'tel', 'line_user_id'].includes(k)) {
          this.reservationData[k] = this.zeroInitKey.includes(k) ? 0 : null;
        }
      });
      this.flag.full = false;
      Object.keys(this.date).forEach((key) => { this.date[key] = null });
    },

    changeStep(type) {
      if (type) this.step += 1;
      else this.step -= 1;
    },

    updateInfo(data) {
      if(data.type === 'user') {
        this.reservationData.linename = data.userData.name;
        this.reservationData.tel = data.userData.tel;
      } else if (data.type === 'date') {
        this.date.day = data.date;
      } else if (data.type === 'plan') {
        this.reservationData.plan_id = data.planId;
        const course = this.selectedPlan.courses.find((c) => c.id === data.courseId);
        this.date.start = course.start;
        this.date.end = course.end;
        this.reservationData.courseId = data.courseId;
        this.changeStep(1);
      } else if (data.type === 'number') {
        this.reservationData.num_adult = data.adult;
        this.reservationData.num_kids = data.kids;
        this.reservationData.num_preschooler = data.preschooler;
      }
    },

    submitReservation() {
      this.flag.loading = true;
      const data = cloneDeep(this.reservationData);
      delete data.courseId;
      const dt = moment(this.date.day).format('YYYY-MM-DD');
      data.start_time = `${dt} ${this.date.start}:00`;
      data.end_time = `${dt} ${this.date.end}:00`;
      data.line_user_id = this.reservationData.line_user_id;
      if (this.shop) data.shop_id = this.shop.id;
      const endpoint = this.userReservations && this.userReservations.length && !this.flag.isAdmin ? 'recreate' : 'create';
      if (endpoint === 'recreate') data.id = this.userReservations[0].id;

      axios({
        method: 'POST',
        url: `/v1/reservation/${endpoint}`,
        data,
      })
      .then((response) => {
        const res = response.data;
        if (res.message === 'The reservation was full.') {
          this.flag.full = true;
        } else if (res.reservationId) {
          this.flag.registed = true;
        }
        this.flag.loading = false;
      })
      .catch((error) => {
        console.log(error);
        this.flag.error = true;
        this.flag.loading = false;
      });
    },
  },
};
</script>

<style>
@import './assets/scss/_variables.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--font);
  overflow: scroll;
}

body {
  margin: 0;
  background: #eee;
  padding: 6%;
  overflow: scroll;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

p {
  margin: 0;
}
</style>

<style lang="scss" module>
.title {
  font-size: 16px;
}
.font_sm {
  font-size: 14px;
}
.nonReservation {
  font-size: 14px;
  a {
    color: var(--font);
  }
}
</style>
