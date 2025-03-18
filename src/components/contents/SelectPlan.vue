<template>
  <div>
    <basic-box :title="'プランの選択'">
      <p v-if="!flag.checked">Loading...</p>
      <p v-else-if="flag.error">処理中にエラーが発生しました。日付選択からやり直してください。</p>
      <div v-else>
        <p :class="$style.remark">※全プランキャンセルは４日前まで無料です</p>
        <ul :class="$style.plans">
          <li
            v-for="plan in plans"
            :key="plan.id">
            <Card :image="plan.image">
              <div :class="$style.inner">
                <p :class="$style.label">{{ plan.label }}</p>
                <p :class="$style.description">{{ plan.description }}</p>
                <spacer :y="2"/>
                <div v-if="detailOpenIds.includes(plan.id)">
                  <ul :class="$style.detail">
                    <li v-for="item in items" :key="item.name" v-show="plan[item.name]">
                      <p :class="$style.detail_label">{{ item.label }}</p>
                      <ul
                        :class="$style.detail_values"
                        v-if="item.type === 'array'">
                        <li
                          v-for="(v, i) in plan[item.valueKey]"
                          :key="i">
                          <p v-if="item.name === 'prices'">¥{{ v.amount.toLocaleString() }} / {{ v.per }}</p>
                          <p v-else-if="item.name === 'businessHours'">{{ v.label }} / {{ v.value }}</p>
                          <p v-else-if="item.name === 'rentalItems'">{{ rentalItem(v).label }}</p>
                          
                          <p v-else>{{ v }}</p>
                        </li>
                      </ul>

                      <div v-if="item.name === 'availableNumber'"><p>{{ plan.availableNumber.min }}〜{{ plan.availableNumber.max }}名<span v-if="plan.availableNumber.note">({{ plan.availableNumber.note }})</span></p></div>

                      <div v-if="item.name === 'carryOn'">
                        <div>
                          <p :class="$style.underline">食材</p>
                          <p>{{ plan.carryOn.food }}</p>
                        </div>
                        <div>
                          <p :class="$style.underline">飲み物</p>
                          <p>{{ plan.carryOn.drink }}</p>
                        </div>
                      </div>

                      <div v-if="item.name === 'trash' || item.name === 'animal'"><p>{{ plan[item.name] }}</p></div>

                      <div v-if="item.name === 'option'">
                        <div v-for="opt in plan.option" :key="opt.name">
                          <p :class="$style.optlabel">[{{ opt.label }}]</p>
                          <ul>
                            <li v-for="(optItem, i) in opt.items"
                              :key="i">
                              <p :class="$style.optItemlabel">{{ optItem.label }}</p>
                              <div v-if="optItem.name === 'prices'">
                                <p v-for="(p, i) in optItem.prices" :key="i">¥{{ p.amount.toLocaleString() }}/{{ p.per }}</p>
                              </div>
                              <div v-else>
                                <p v-for="(it, i) in optItem.items" :key="i">{{ it }}</p>
                              </div>
                            </li>
                            <li v-if="opt.notes">
                              <p>{{ opt.notes }}</p>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div v-if="item.noteKey">
                        <p
                          v-for="n in plan[item.noteKey]"
                          :key="n"
                          :class="$style.detail_remark">{{ n }}</p>
                      </div>
                    </li>
                  </ul>
                  <div :class="$style.notes">
                    <p
                      v-for="(note, i) in plan.notes"
                      :key="i">{{ note }}</p>
                  </div>
                </div>
                <p :class="$style.detail_btn">
                  <span @click="changeOpenStatus(plan.id)">詳細を{{ detailOpenIds.includes(plan.id) ? '閉じる' : '見る' }}</span>
                </p>
                <ul :class="$style.courses">
                  <li
                    v-for="c in plan.courses"
                    :key="c.id">
                    <p :class="$style.courselabel">{{ c.label }}（{{ c.start }} ~ {{ c.end }}）</p>
                  <btn
                    v-if="availableCourseIds.includes(c.id)"
                    @click="updatePlan(plan.id, c.id)">このコースで予約する</btn>
                  <btn v-else
                    :disabled="true">このコースは予約できません</btn>
                  </li>
                </ul>
                <spacer :y="1"/>
              </div>
            </Card>
          </li>
        </ul>
      </div>
      <spacer :y="2"/>
      <btn
        :type="'bdr'"
        @click="flag.error ? initDate() : changeStep(0)">戻る</btn>
    </basic-box>
  </div>
</template>

<script>
import moment from 'moment'
import Spacer from '../parts/Spacer.vue';
import Btn from '../parts/Btn.vue';
import BasicBox from '../parts/BasicBox.vue';
import Card from '../parts/Card.vue';
import axios from '../../plugins/axios';

export default {
  name: 'select-plan', 
  props: {
    plans: {
      type: Array,
    },
    rentalItems: {
      type: Array,
    },
    date: {
      type: Date,
    },
    shopId: {
      type: Number,
    },
  },
  components: {
    Spacer,
    Btn,
    BasicBox,
    Card,
  },
  data() {
    return {
      flag: {
        checked: false,
        error: false,
      },
      detailOpenIds: [],
      availableCourseIds: [],
      items: [
        {
          type: 'array',
          label: '料金',
          name: 'prices',
          valueKey: 'prices',
          noteKey: 'priceNotes',
        },
        {
          type: 'array',
          label: '料金に含まれるもの',
          name: 'service',
          valueKey: 'service',
        },
        {
          type: 'array',
          label: '設備',
          name: 'equipment',
          valueKey: 'equipment',
          noteKey: 'equipmentNotes',
        },
        {
          type: 'array',
          label: '営業時間',
          name: 'businessHours',
          valueKey: 'businessHours',
          noteKey: 'businessHoursNotes',
        },
        {
          type: 'object',
          label: '１サイトの利用人数',
          name: 'availableNumber',
        },
        {
          type: 'object',
          label: '持ち込みに関して',
          name: 'carryOn',
        },
        {
          type: 'text',
          label: 'ゴミの扱い',
          name: 'trash',
        },
        {
          type: 'text',
          label: 'ペットの同伴',
          name: 'animal',
        },
        {
          type: 'array',
          label: 'BBQ食材',
          name: 'foods',
          valueKey: 'foods',
        },
        {
          type: 'array',
          label: '追加食材',
          name: 'extraFood',
          valueKey: 'extraFood',
        },
        {
          type: 'array',
          label: '追加レンタル',
          name: 'rentalItems',
          valueKey: 'rentalItems',
        },
        {
          type: 'object',
          label: 'オプション',
          name: 'option',
          valueKey: 'option',
        },
      ],
    };
  },
  created() {
    this.checkAvailableCourses();
  },
  methods: {
    updatePlan(pId, cId) {
      this.$emit('edited', { type: 'plan', planId: pId, courseId: cId });
    },
    changeStep(type) {
      this.$emit('changeStep', type);
    },
    initDate() {
      this.changeStep(0);
      this.$emit('initDate');
    },
    rentalItem(i) {
      return this.rentalItems.find((r) => r.id === i);
    },
    changeOpenStatus(id) {
      const idx = this.detailOpenIds.indexOf(id);
      if (idx < 0) this.detailOpenIds.push(id);
      else this.detailOpenIds.splice(idx, 1);
    },

    checkAvailableCourses() {
      this.flag.checked = false;
      const date = moment(this.date).format('YYYY-MM-DD');
      axios({
        methods: 'GET',
        url: '/v1/reservation/get/empty',
        params: {
          date,
          shop_id: this.shopId,
        },
      })
        .then((response) => {
          const res = response.data;
          this.availableCourseIds = res.empty;
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
.remark {
  font-size: 12px;
  margin-bottom: 12px;
}
.plans {
  li {
    &:not(:first-child) {
      margin-top: 16px;
    }
  }
}
.inner {
  padding: 16px;
}
.label {
  font-weight: bold;
  margin-bottom: 4px;
}
.description {
  font-size: 12px;
}
.detail {
  font-size: 12px;
  &_btn {
    font-size: 12px;
    margin: 12px 0;
    text-align: center;
    text-decoration: underline;
  }
  &_label {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  &_values {
    li {
      &:not(:first-child) {
        margin-top: 0;
      }
    }
  }
  &_remark {
    margin-top: 6px;
    font-size: 12px;
  }
}
.underline {
  text-decoration: underline;
}
.courses {
  border-top: 1px solid #ccc;
  padding-top: 18px;
  li {
    &:not(:first-child) {
      border-top: 1px solid #ccc;
      padding-top: 18px;
    }
  }
}
.courselabel {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 12px;
}
.optlabel {
  font-weight: bold;
  margin-bottom: 4px;
}
.optItemlabel {
  border-bottom: 1px solid var(--gray);
  margin-bottom: 4px;
  display: inline-block;
}

.notes {
  font-size: 12px;
  margin-top: 24px;
  p {
    &::before {
      content: '※'
    }
  }
}
</style>