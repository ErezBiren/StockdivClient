<template>
  <q-page class="column q-pa-md">
    <div class="row justify-around">
      <q-card
        class="text-center shadow-8 bg-light-blue-1 q-ma-md"
        v-for="(item, i) in store.dividendAlerts"
        v-bind:key="i"
      >
        <q-card-section class="cursor-pointer" @click="gotoTickerPage(item.ticker)">
          <b
            ><q-img
              class="q-ma-sm"
              :src="item.logo"
              style="height: 16px; max-width: 16px"
            />{{ item.ticker }}</b
          >
          <q-separator />
          {{ item.eventDate.substring(0, 10) }}
          <q-separator />
        </q-card-section>
        <q-card-section :class="getAlertColor(item.redFlag)">
          {{ item.alert }}
          <q-separator />
          <div v-if="item.percentage != 0">
            <q-icon class="q-mr-xs" :name="getArrow(item.percentage)" />{{
              filters.formatToPercentage(item.percentage)
            }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { filters } from '../utils/utils';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'DividendAlerts',
  setup() {
    const store = stockdivStore();
    const router = useRouter();
    return {
      store,
      filters,
      router,
    };
  },
  methods: {
    getAlertColor(flag: number): string {
      return flag === 0 ? 'text-green' : 'text-red';
    },
    getArrow(percent: number): string {
      return percent < 0 ? 'trending_down' : 'trending_up';
    },
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${this.store.selectedPortfolio}/${ticker}`,
      });
    },
  },
});
</script>
