<template>
  <q-page class="column q-pa-md">
    <q-card class="text-center shadow-8 bg-light-blue-1 col relative-position">
      <q-card-section class="absolute-full scroll">
        <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          date-type="rounded"
          animated
          style="background: #e1f5fe"
        >
          <template #day="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="getEntryColor(event.eventType, event.projected)"
                v-if="
                  (event.eventType === EventTypeEnum.PAYDAY && showPay) ||
                  (event.eventType === EventTypeEnum.EXDAY && showEx)
                "
              >
                <q-img
                  class="q-ma-xs cursor-pointer"
                  @click="gotoTickerPage(event.ticker)"
                  :src="event.logo"
                  style="height: 16px; width: 16px"
                />
                {{ event.ticker }}
                {{ event.eventType === EventTypeEnum.PAYDAY ? 'Pay:' : 'Ex:' }}
                {{ filters.formatToCurrency(event.amount) }} ({{
                  filters.formatToCurrency(event.total)
                }})
              </div>
            </template>
          </template>
        </q-calendar-month>
      </q-card-section>
      <q-page-sticky position="top">
        <div class="row no-wrap q-pa-sm bg-white shadow-8">
          <q-btn
            dense
            flat
            :disabled="canBrowsePrev"
            icon="arrow_back_ios"
            class="q-mt-xs cursor-pointer"
            @click="browseMonth(false)"
            size="xs"
            ><q-tooltip class="bg-indigo">Previous month</q-tooltip></q-btn
          ><q-separator vertical class="q-mx-sm" />
          <q-toggle dense v-model="showEx" label="Ex" class="q-mr-md" />
          <q-toggle dense v-model="showPay" label="Pay" />
          <q-separator vertical class="q-mx-sm" /><q-btn
            dense
            flat
            icon="arrow_forward_ios"
            size="xs"
            :disabled="canBrowseNext"
            @click="browseMonth(true)"
            class="q-mt-xs cursor-pointer"
            ><q-tooltip class="bg-indigo">Next month</q-tooltip></q-btn
          >
        </div>
      </q-page-sticky>

      <q-inner-loading :showing="monthlyViewLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar';
import { filters, bus, showNotification } from '../utils/utils';
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import { IMonthViewEvent } from 'src/utils/interfaces/IMonthViewEvent';
import axios, { AxiosError } from 'axios';
import { EventTypeEnum } from '../utils/enums/EventTypeEnum';
import { api } from 'src/boot/axios';
import { stockdivStore } from 'stores/stockdivStore';
import { showAPIError } from 'src/utils/utils';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'MonthlyDividendsView',
  components: {
    QCalendarMonth,
  },
  setup() {
    const store = stockdivStore();
    const router = useRouter();
    return {
      month: ref<number>(0),
      router,
      store,
      showEx: ref<boolean>(true),
      showPay: ref<boolean>(true),
      filters,
      EventTypeEnum,
      selectedDate: ref<string>(),
      monthlyViewLoading: ref<boolean>(false),
      events: ref<IMonthViewEvent[]>([]),
    };
  },
  methods: {
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${ticker}`,
      });
    },
    getEntryColor(eventType: EventTypeEnum, projected: boolean) {
      if (projected) return 'row no-wrap q-my-xs text-purple-8';
      else if (eventType === EventTypeEnum.EXDAY) return 'row no-wrap q-my-xs text-blue-5';
      else return 'row no-wrap q-my-xs text-green-5';
    },
    getMonthEvents() {
      this.monthlyViewLoading = true;
      axios
        .all([
          api.get(
            `dividend/portfolio/${this.store.selectedPortfolio}/monthView/${this.selectedDate}`
          ),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.events = responses[0].data;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.monthlyViewLoading = false;
        });
    },
    browseMonth(next: boolean) {
      this.month += next ? 1 : -1;
      this.router.push({
        path: `/monthlyDividendsView/${new Date(
          Date.parse(this.month + 1 + ' 1, 2022')
        ).toLocaleString('en-us', {
          month: 'long',
        })}`,
      });
    },
    async portfolioChange() {
      let { data } = await api.get(
        `portfolio/${this.store.selectedPortfolio}/currency`
      );
      this.store.portfolioCurrency = data;
      this.getMonthEvents();
    },
  },
  mounted() {
    if (this.store.token === '') {
      showNotification('You will need to re-login');
      this.router.push('/');
    } else {
      this.month = new Date(
        Date.parse(useRoute().params.month + ' 1, 2022')
      ).getMonth();
      this.selectedDate = `${new Date().getFullYear()}-${this.month + 1}-01`;
      this.getMonthEvents();
      bus.on('changedPortfolio', this.portfolioChange);
      bus.on('changedSettings', this.getMonthEvents);
    }
  },
  unmounted() {
    bus.off('changedPortfolio', this.getMonthEvents);
    bus.off('changedSettings', this.getMonthEvents);
  },
  computed: {
    canBrowseNext(): boolean {
      return this.month === 11;
    },
    canBrowsePrev(): boolean {
      return this.month === 0;
    },
    eventsMap() {
      const map: { [key: string]: IMonthViewEvent[] } = {};
      if (this.events.length > 0) {
        this.events.forEach((event) => {
          (map[event.eventDate] = map[event.eventDate] || []).push(event);
        });
      }
      return map;
    },
  },
});
</script>
