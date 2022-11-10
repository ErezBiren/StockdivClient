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
                <div :class="getEntryColor(event.eventType)">
                  <q-img class="q-mr-xs"
                    :src="event.logo"
                    style="height: 24px; max-width: 24px"
                  />
                  {{ event.ticker }}
                  {{
                    event.eventType === EventTypeEnum.PAYDAY
                      ? 'Pay:'
                      : 'Ex:'
                  }}
                  {{ filters.formatToCurrency(event.amount) }} ({{ filters.formatToCurrency(event.total) }})
                </div>
              </template>
            </template>
          </q-calendar-month>
        </q-card-section>
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
import { filters } from '../utils/utils';
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import { IMonthViewEvent } from 'src/utils/interfaces/IMonthViewEvent';
import axios, { AxiosError } from 'axios';
import { EventTypeEnum } from '../utils/enums/EventTypeEnum';
import { api } from 'src/boot/axios';
import { stockdivStore } from '../stores/stockdivStore';
import { showAPIError } from 'src/utils/utils';
export default defineComponent({
  name: 'MonthlyDividendsView',
  components: {
    QCalendarMonth,
  },
  setup() {
    let month = 0;
    const store = stockdivStore();
    return {
      month,
      store,
      filters,
      EventTypeEnum,
      selectedDate: ref<string>(),
      monthlyViewLoading: ref<boolean>(false),
      events: ref<IMonthViewEvent[]>([]),
    };
  },
  methods: {
    getEntryColor(eventType: EventTypeEnum) {
      if (eventType === EventTypeEnum.EXDAY) return 'row no-wrap q-my-xs text-blue-5';
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
  },
  mounted() {
    this.month =
      new Date(Date.parse(useRoute().params.month + ' 1, 2022')).getMonth() + 1;
    this.selectedDate = `${new Date().getFullYear()}-${this.month}-01`;
    this.getMonthEvents();
  },
  computed: {
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
