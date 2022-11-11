<template>
  <q-page class="column q-pa-md">
    <q-card class="text-center shadow-8 bg-light-blue-1 col relative-position">
      <q-card-section class="absolute-full scroll">
        <q-markup-table
          separator="cell"
          flat
          dense
          class="bg-light-blue-1 tableClip"
        >
          <thead>
            <tr>
              <th class="bg-green-2"><b>Ticker</b></th>
              <th class="bg-green-2">Date</th>
              <th class="bg-green-2">Alert</th>
              <th class="bg-green-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in store.dividendAlerts" v-bind:key="i">
              <td>
                <b
                  ><q-img
                    class="q-ma-sm"
                    :src="item.logo"
                    style="height: 16px; max-width: 16px"
                  />{{ item.ticker }}</b
                >
              </td>
              <td>
                {{ item.eventDate.substring(0, 10) }}
              </td>
              <td :class="getAlertColor(item.redFlag)">
                {{ item.alert }}
              </td>
              <td :class="getAlertColor(item.redFlag)">
                <div v-if="item.percentage != 0">
                  <q-icon class="q-mr-xs" :name="getArrow(item.percentage)" />{{
                    filters.formatToPercentage(item.percentage)
                  }}
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { filters } from '../utils/utils';
export default defineComponent({
  name: 'DividendAlerts',
  setup() {
    const store = stockdivStore();
    return {
      store,
      filters,
    };
  },
  methods: {
    getAlertColor(flag: number): string {
      return flag === 0 ? 'text-green' : 'text-red';
    },
    getArrow(percent: number): string {
      return percent < 0 ? 'trending_down' : 'trending_up';
    },
  },
});
</script>
