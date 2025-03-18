<template>
  <div>
    <div v-if="flag.showMenu" :class="$style.menu">
      <basic-box>
        <div :class="$style.logo"/>
        <spacer :y="4"/>
        <p
          v-html="menu.description"
          :class="$style.description"/>
        <spacer :y="4"/>
        <ul :class="$style.infolist">
          <li v-for="info in menu.baseInfo">
            <p :class="$style.menulabel">{{ info.label }}</p>
            <div>
              <div v-if="info.name === 'price'">
                <p v-for="p in info.value" :key="p.name">{{ p.label }}：¥{{ p.price.toLocaleString() }}</p>
                <p :class="$style.note">※{{ info.note }}</p>
              </div>
              <div v-else-if="info.name === 'food' || info.name === 'drink'">
                <p v-for="(v, i) in info.values" :key="i">・{{ v }}</p>
              </div>
              <p v-else :class="$style.infovalue" v-html="info.value"/>
            </div>
          </li>
        </ul>
        <spacer :y="4"/>
        <div>
          <div v-if="!canReserve" :class="$style.hasRsv">
            <div>
              <p>お客様はすでに予約を完了しております。<br>予約はお一人さま一席までになります。<br>お問い合せ：<a href="tel:0272252498">027-225-2498</a></p>
            </div>
          </div>
          <btn v-else @click="flag.showMenu = false" :disabled="true">予約する</btn>
        </div>
      </basic-box>
      <basic-box
        v-if="reservations.length"
        :class="$style.reservation_wrap"
        v-for="(reservation, i) in reservations"
        :key="reservation.id">
        <div v-if="!flag.loading">
          <p :class="$style.reservation_label">現在のご予約{{ flag.isAdmin ? ` (${i + 1})` : '' }}</p>
            <ul :class="$style.reservation">
              <li>お名前：{{ reservation.linename }}</li>
              <li>電話番号：{{ reservation.tel }}</li>
              <li>日時：{{ formatTimestamp(reservation.reservation_date, 'YYYY/MM/DD') }} {{ reservation.course === 1 ? '18:00' : '20:00' }}</li>
              <li>人数：{{ reservation.num_adult + reservation.num_jr + reservation.num_kids }}名</li>
            </ul>
            <div :class="$style.cancel" @click="cancel(reservation.id)">キャンセルする</div>
        </div>
        <div v-else>Loading...</div>
      </basic-box>
    </div>
    <div v-else>
      <!-- エラー発生時 -->
      <basic-box v-if="flag.error">
        <p>処理中にエラーが発生しました。ページを閉じて再度やり直してください。</p>
      </basic-box>

      <!-- 予約完了 -->
      <basic-box v-else-if="flag.registed">
        <p>予約が完了しました！</p>
      </basic-box>

      <!-- 予約完了 -->
      <basic-box v-else-if="flag.full">
        <p>枠が埋まってしまったため予約をお取りすることができませんでした。</p>
      </basic-box>

      <!-- 正常に処理されていればこちら -->
      <div v-else>
        <!-- step1 ユーザー情報入力 -->
        <UserInfo
          v-if="step === 1"
          :initname="user.linename"
          :inittel="user.tel"
          @edited="updateInfo"
          @changeStep="changeStep" />

        <!-- step2 日付選択 -->
        <div v-if="step === 2">
          <p v-if="flag.loading">Loading...</p>
          <basic-box v-else>
            <p :class="$style.title">日時を選択してください。</p>
            <ul :class="$style.datelist">
              <li
                v-for="d in allDate"
                :key="d">
                <p :class="$style.date">{{ formatTimestamp(d.date, 'YYYY/MM/DD') }}({{ ['日', '月', '火', '水', '木', '金', '土'][weekday(d.date)] }})</p>
                <spacer :y="1"/>
                <ul :class="$style.btnlist">
                  <li v-for="c in sortCourse(d.course)" :key="c">
                    <btn
                      :disabled="isDisabled(d.date, c)"
                      @click="isDisabled(d.date, c) ? '' : selectDate(d.date, Number(c))">{{ Number(c) === 1 ? '18:00 - 19:30' : '20:00 - 21:30' }}{{ isDisabled(d.date, c) ? ' 満席' : '' }}</btn>
                  </li>
                </ul>
              </li>
            </ul>
            <spacer :y="2"/>
            <btn
              :type="'bdr'"
              @click="changeStep(0)">戻る</btn>
          </basic-box>
        </div>

        <!-- step3 人数入力 -->
        <div v-if="step === 3">
          <basic-box>
            <p :class="$style.title">予約人数を入力してください。</p>
            <p :class="$style.remark">可能予約人数は１〜６人です。</p>
            <ul :class="$style.selectlist">
              <li
                v-for="(t, i) in num_types"
                :key="t.name">
                <p :class="$style.label">{{ t.label }}</p>
                <select
                  :class="$style.select"
                  :name="t.name" :id="i"
                  @change="selectNumber">
                  <option
                    v-if="t.name !== 'adult'"
                    :value="0">0名</option>
                  <option
                    v-for="n of 6"
                    :key="n"
                    :value="n">{{ n }}名</option>
                </select>
              </li>
            </ul>
            <spacer :y="2"/>
            <p
              v-if="!isUnderMaxNum"
              :class="$style.error">※最大６名です。</p>
            <btn
              :disabled="!isUnderMaxNum"
              @click="changeStep(1)">予約内容を確認する</btn>
            <spacer :y="1"/>
            <btn
              :type="'bdr'"
              @click="changeStep(0)">戻る</btn>
          </basic-box>
        </div>

        <!-- step4 入力内容の確認 -->
        <div v-if="step === 4">
          <p v-if="flag.loading">Loading...</p>
          <basic-box v-else>
            <p :class="$style.title">入力内容の確認</p>
            <ul :class="$style.confirmlist">
              <li
                v-for="item in items"
                :key="item.name">
                <p :class="$style.label">{{ item.label }}</p>
                <div :class="$style.value">
                  <p v-if="item.name === 'plan'">BBQ BEER GARDEN</p>
                  <p v-else-if="item.name === 'date'">{{ formatTimestamp(reservationData.reservation_date, 'YYYY/MM/DD') }}</p>
                  <div v-else-if="item.name === 'num'">
                    <p
                      v-for="t in num_types"
                      :key="t.name">{{ t.label }}：{{ t.value }}名</p>
                  </div>
                  <p v-else>{{ reservationData[item.name] }}</p>
                </div>
              </li>
            </ul>
            <spacer :y="2"/>
            <btn @click="registReservation">予約を確定する</btn>
            <spacer :y="1"/>
            <btn
              :type="'bdr'"
              @click="changeStep(0)">戻る</btn>
          </basic-box>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import UserInfo from './UserInfo.vue'
import BasicBox from '../parts/BasicBox.vue'
import Btn from '../parts/Btn.vue'
import Spacer from '../parts/Spacer.vue'
import cf from '../../mixins/commonFunctions'
import axios from '../../plugins/axios'

export default {
  name: 'gw-reservation',
  mixins: [cf],
  props: {
    user: {
      type: Object,
    }
  },
  components: {
    UserInfo,
    BasicBox,
    Btn,
    Spacer,
  },
  created() {
    this.init()
  },
  data() {
    return {
      flag: {
        loading: false,
        error: false,
        showMenu: true,
        isAdmin: false,
      },
      reservations: [],
      step: 1,
      reservationData: {
        line_user_id: null,
        linename: null,
        tel: null,
        reservation_date: null,
        num_adult: 1,
        num_jr: 0,
        num_kids: 0,
        course: null,
      },
      availableDate: [],
      num_types: [
        {
          label: '大人',
          name: 'adult',
          value: 1,
        },
        {
          label: '中学生以上',
          name: 'jr',
          value: 0,
        },
        {
          label: '小学生',
          name: 'kids',
          value: 0,
        },
      ],
      items: [
        {
          label: 'プラン',
          name: 'plan',
        },
        {
          label: 'お名前',
          name: 'linename',
        },
        {
          label: '電話番号',
          name: 'tel',
        },
        {
          label: '予約日',
          name: 'date',
        },
        {
          label: '予約人数',
          name: 'num'
        },
      ],
      menu: {
        baseInfo: [
          {
            label: '開催期間',
            name: 'date',
            value: '2023/5/12 - 2023/09/30<br>毎週金・土開催',
          },
          {
            label: '時間',
            name: 'hour',
            value: '18:00-19:30、20:00-21:30<br>［最終入場20時］［90分2部制］',
          },
          {
            label: '場所',
            name: 'place',
            value: '道の駅まえばしHutteHayashi Restaurant',
          },
          {
            label: '価格',
            name: 'price',
            value: [
              {
                label: '大人',
                name: 'adult',
                price: 5000,
              },
              {
                label: '中学生以上',
                name: 'jr',
                price: 3300
              },
              {
                label: '小学生',
                name: 'kids',
                price: 2500,
              }
            ],
            note: '未就学児は無料。表示価格はすべて消費税込みとなります。',
          },
          {
            label: '食べ放題メニュー例',
            name: 'food',
            values: ['福豚', 'ホルモン', 'ソーセージ', '焼き野菜', 'サラダ', 'スープ', 'ごはん'],
          },
          {
            label: 'フリードリンク',
            name: 'drink',
            values: ['生ビール', 'サワー', 'ハイボール', '赤・白ワイン', 'ソフトドリンク'],
          }
        ]
      }
    }
  },
  computed: {
    isUnderMaxNum() {
      let sum = 0
      this.num_types.forEach((t) => { sum += t.value })
      return sum <= 6
    },
    canReserve() {
      return !this.reservations.length || this.flag.isAdmin
    },
    allDate() {
      const end = moment('2023-09-30 23:59:59')
      const diff = end.diff(new Date(), 'days')
      const arr = []
      for (let i = 0; i < diff + 1; i += 1) {
        const today = moment(new Date())
        const target = today.add(i, 'd')
        const targetWeekday = target.format('d')
        const range = 3 // 3カ月後まで予約可能
        if ([5, 6].includes(Number(targetWeekday)) && moment(new Date()).add(range - 1, 'M').diff(target, 'M') >= 0) {
          arr.push({
            date: target.format('YYYY-MM-DD'),
            course: [1, 2],
          })
        }
      }
      return arr
    }
  },
  methods: {
    weekday(d) {
      return moment(d).format('d')
    },
    sortCourse(arr) {
      return arr.sort((a, b) => {
        if (a < b) return -1
        return 0
      })
    },
    isDisabled(date, course) {
      let flag = true
      this.availableDate.forEach((d) => {
        if (date === d.date && d.course.includes(String(course))) flag = false
      })
      return flag
    },
    init(obj) {
      this.reservationData.line_user_id = this.user.id;
      this.reservationData.linename = this.user.linename;
      this.hasReservation = false
      this.reservation = null
      const user = obj || this.user // update時はオブジェクトが渡される
      this.reservations = user.gwReservation
      this.flag.isAdmin = Boolean(this.user.admin.length)
    },
    changeStep(type) {
      if (type) this.step += 1
      else this.step -= 1

      // 日付選択へ遷移する時はチェック走らせる
      if (this.step === 2) {
        this.flag.loading = true
        this.availableDate = []
        axios({
          method: 'GET',
          url: `/v1/gwReservation/get/empty`,
          params: this.allDate,
        })
          .then((response) => {
            const res = response.data
            this.availableDate = res.empty
          })
          .catch((error) => {
            console.log(error)
            this.flag.error = true
          })
          .finally(() => {
            this.flag.loading = false
          })
      }
    },
    updateInfo(data) {
      this.reservationData.linename = data.userData.name
      this.reservationData.tel = data.userData.tel
    },
    selectDate(date, course) {
      this.reservationData.reservation_date = date
      this.reservationData.course = course
      this.changeStep(1)
    },
    selectNumber(e) {
      this.num_types[e.target.id].value = Number(e.target.value)
    },
    registReservation() {
      this.flag.loading = true
      this.num_types.forEach((t) => {
        this.reservationData[`num_${t.name}`] = t.value
      })

      this.flag.loading = true
      axios({
        method: 'POST',
        url: `/v1/gwReservation/create`,
        data: this.reservationData,
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
          console.log(error)
          this.flag.error = true
        })
        .finally(() => {
          this.flag.loading = false
        })
    },
    cancel(rsvId) {
      if (!confirm('予約をキャンセルしますよろしいですか？')) return
      this.flag.loading = true
      axios({
        method: 'POST',
        url: '/v1/gwReservation/delete',
        data: { id: rsvId },
      })
        .then(() => {
          this.$emit('update', 'gwReservation')
        })
        .catch((error) => {
          console.log(error)
          this.flag.error = true
        })
        .finally(() => {
          this.flag.loading = false
        })
    },
  },
};
</script>

<style lang="scss" module>
.title {
  font-weight: bold;
  margin-bottom: 12px;
}
.menu {
  font-size: 14px;
}
.logo {
  width: 100%;
  padding-top: calc(100% * (858/612));
  border-radius: 4px 4px 0 0;
  background-image: url('/images/beergarden_extra.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0 auto;
}
.description {
  font-size: 12px;
  text-align: center;
}
.infolist {
  li {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
}
.menulabel {
  font-weight: bold;
}
.note {
  font-size: 12px;
}

.hasRsv {
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.btnlist {
  li {
    &:not(:first-child) {
      margin-top: 8px;
    }
  }
}
.datelist {
  margin-top: 24px;
  > li {
    &:not(:first-child) {
      margin-top: 20px;
    }
  }
}
.date {
  font-weight: bold;
}
.remark {
  font-size: 12px;
  margin-bottom: 12px;
}
.selectlist {
  li {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
}
.label {
  font-size: 14px;
  font-weight: bold;
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
.error {
  font-size: 12px;
  color: red;
  margin-bottom: 12px;
}

.confirmlist {
  li {
    padding: 8px;
    border-top: 1px solid #eee;
    font-size: 14px;

    .label {
      font-size: 12px;
    }
  }
}

.reservation {
  &_wrap {
    margin-top: 16px;
  }
  &_label {
    font-weight: bold;
    margin-bottom: 8px;
  }
  > li {
    padding: 6px 0;
    border-top: 1px solid #eee;
  }
}
.cancel {
  text-align: center;
  font-size: 12px;
  color: var(--gray);
  text-decoration: underline;
}
</style>
