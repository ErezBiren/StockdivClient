<template>
  <q-page class="q-pa-xs">
    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <q-markup-table separator="cell" flat dense class="bg-light-blue-1">
          <thead>
            <tr>
              <th class="bg-green-2">Ticker</th>
              <th class="bg-green-2">Jan</th>
              <th class="bg-green-2">Feb</th>
              <th class="bg-green-2">Mar</th>
              <th class="bg-green-2">Apr</th>
              <th class="bg-green-2">May</th>
              <th class="bg-green-2">Jun</th>
              <th class="bg-green-2">Jul</th>
              <th class="bg-green-2">Aug</th>
              <th class="bg-green-2">Sep</th>
              <th class="bg-green-2">Oct</th>
              <th class="bg-green-2">Nov</th>
              <th class="bg-green-2">Dec</th>
              <th class="bg-green-2 text-weight-bolder">Total</th>
              <th class="bg-green-2">Jan</th>
              <th class="bg-green-2">Feb</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dividendData" v-bind:key="item.exDay">
              <td>
                {{ item.exDay.substring(0, 10) }}
              </td>
              <td>
                {{ item.payDay.substring(0, 10) }}
              </td>
              <td>
                {{ filters.formatToCurrency(item.amount) }}
              </td>
              <td :class="getIncreasePercentColor(item.increasePercent)">
                <q-icon :name="getIncreaseArrow(item.increasePercent)" />{{
                  item.increasePercent === 0
                    ? ''
                    : filters.formatToPercentage(item.increasePercent)
                }}
              </td>
              <td>
                <q-checkbox
                  dense
                  disable
                  v-model="item.special"
                  checked-icon="task_alt"
                  unchecked-icon="highlight_off"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-inner-loading :showing="yearlyPaymentLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import { showAPIError } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
export default defineComponent({
  name: 'YearlyPayment',
  setup() {
    const store = stockdivStore();
    return {
      yearlyPaymentLoading: ref<boolean>(false),
      store,
    };
  },
  mounted() {
    this.yearlyPaymentLoading = true;
    axios
      .all([api.get(`dividend/portfolio/${this.store.selectedPortfolio}/all`)])
      .then(
        axios.spread(async (...responses) => {
          //
        })
      )
      .catch((err: AxiosError) => {
        showAPIError(err);
      })
      .finally(() => {
        this.yearlyPaymentLoading = false;
      });
  },
});
</script>
