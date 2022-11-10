<template>
  <q-page>
    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section class="q-pa-sm"
        ><q-img
          :src="tickerLogo"
          style="height: 32px; max-width: 32px"
          class="q-mr-sm"
        />
        <strong>{{ ticker }}</strong
        >: {{ tickerName }}
        <q-icon
          class="q-ml-md cursor-pointer"
          name="edit_notes"
          size="sm"
          @click="openUserDataDialog"
        >
          <q-tooltip
            class="userDataTooltipFont bg-indigo"
            transition-show="rotate"
            transition-hide="rotate"
          >
            <div v-html="getTickerDataTooltip"></div>
          </q-tooltip>
        </q-icon>
        <q-separator />
        <div :class="getMarketValueColor">
          {{ filters.formatToCurrency(tickerPrice) }}
          <div v-if="tickerInvested > 0">
            (<q-icon :name="getArrow" />{{
              filters.formatToPercentage(plPercentage)
            }})
          </div>
        </div>
        <div :class="getDailyChangeColor">
          Daily PL: {{ filters.formatToCurrency(dailyChange) }} (<q-icon
            :name="getDailyArrow"
          />{{ filters.formatToPercentage(dailyChangePercentage) }})
        </div>
        <q-separator />
        <q-icon
          name="add_shopping_cart"
          class="cursor-pointer q-ma-sm"
          size="sm"
          @click="addPurchase()"
          ><q-tooltip class="bg-indigo">Add transaction</q-tooltip></q-icon
        >
        <q-icon
          name="edit"
          class="cursor-pointer q-ma-sm"
          size="sm"
          v-if="tickerInvested > 0"
          @click="changeTicker()"
          ><q-tooltip class="bg-indigo">Change ticker</q-tooltip></q-icon
        >
        <q-icon
          name="call_split"
          class="cursor-pointer q-ma-sm"
          size="sm"
          v-if="tickerInvested > 0"
          @click="splitTicker()"
          ><q-tooltip class="bg-indigo"
            >Split: Automatically recalculate shares and share price</q-tooltip
          ></q-icon
        >
      </q-card-section>
      <q-inner-loading :showing="tickerInfoLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1"
      v-if="tickerInvested > 0"
    >
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          :options="investmentsChartOptions"
          :series="investmentsChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="tickerInvestmentsLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1"
      v-if="tickerInvested > 0 && dividendData.length > 0"
    >
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          :options="roiChartOptions"
          :series="roiChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="tickerInvestmentsLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1"
      v-if="dividendData.length > 0"
    >
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          :options="yearsProjectionOptions"
          :series="yearsProjectionSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="averageIncreaseLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="line"
          height="300"
          ref="whatHappenedSinceChart"
          :options="whatHappenedSinceOptions"
          :series="whatHappenedSinceSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="whatHappenedSinceLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1"
      v-if="dividendData.length > 0"
    >
      <q-card-section>
        <q-markup-table
          separator="horizontal"
          flat
          dense
          class="bg-light-blue-1"
          style="height: 300px"
        >
          <thead>
            <tr>
              <th class="bg-green-2">Ex</th>
              <th class="bg-green-2">Pay</th>
              <th class="bg-green-2">Amount</th>
              <th class="bg-green-2">% Increment</th>
              <th class="bg-green-2">Special</th>
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
                <q-checkbox dense
                  disable
                  v-model="item.special"
                  checked-icon="task_alt"
                  unchecked-icon="highlight_off"/>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-inner-loading :showing="allDividendsLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md shadow-8 bg-light-blue-1"
      v-if="dividendData.length > 0 || tickerInvested > 0"
    >
      <q-card-section>
        <q-scroll-area
          style="height: 280px; max-width: 100%"
          :thumb-style="thumbStyle"
        >
          <vue-horizontal-timeline
            :items="timelineItems"
            timeline-background="#E1F5FE"
            content-class="timelineFont"
            title-class="timelineTitleFont"
            v-model:item-selected="timelineItem"
            @click="editTransaction()"
          />
        </q-scroll-area>
      </q-card-section>
      <q-inner-loading :showing="timelineLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-page>

  <q-dialog v-model="userDataDialogShow" position="bottom">
    <q-card class="bg-info">
      <q-form @submit="submitUserData">
        <q-card-section class="row no-wrap q-pb-none" dense>
          <div class="q-mt-sm">Notes for {{ ticker }}</div>
          <q-space />
          <q-icon
            name="close"
            flat
            dense
            @click="closeUserDataDialog()"
            class="cursor-pointer"
            ><q-tooltip class="bg-indigo">Close</q-tooltip></q-icon
          >
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input
            v-model="tickerUserData.notes"
            type="textarea"
            counter
            maxlength="200"
            autogrow
            dense
            hint="Notes"
          />
          <div class="row no-wrap">
            <q-input
              v-model.number="tickerUserData.tax"
              type="number"
              dense
              step="0.01"
              hint="Tax"
              :rules="[
                (val) => (val.length !== 0 && val >= 0) || 'Tax is missing',
              ]"
            /><q-space /><q-btn
              icon="done"
              color="primary"
              flat
              type="submit"
              size="md"
              class="cursor-pointer"
              ><q-tooltip class="bg-indigo">Save</q-tooltip></q-btn
            >
          </div>
        </q-card-section>
      </q-form>
      <q-inner-loading :showing="serverProcessing">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog v-model="changeTickerDialogShow" position="bottom">
    <q-card class="bg-info">
      <q-card-section class="row no-wrap q-pb-none" dense>
        <div class="q-mt-sm">Change ticker {{ ticker }}</div>
        <q-space />
        <q-icon
          name="close"
          flat
          dense
          @click="closeChangeTickerPopup()"
          class="cursor-pointer"
          ><q-tooltip class="bg-indigo">Close</q-tooltip></q-icon
        >
      </q-card-section>
      <q-separator />
      <q-card-section class="row no-wrap">
        <q-input
          hint="New Ticker"
          dense
          autofocus
          class="q-mr-sm"
          type="search"
          mask="AAAAAAAAAA"
          v-model="newTicker"
        />
        <q-icon
          name="edit"
          size="sm"
          @click="setNewTicker()"
          class="cursor-pointer q-mt-sm"
          ><q-tooltip class="bg-indigo"
            >Replace {{ ticker }} with {{ newTicker }}</q-tooltip
          ></q-icon
        >
      </q-card-section>
      <q-card-actions>
        * this action will change {{ ticker }} in
        <div class="text-weight-bold">&nbsp;ALL&nbsp;</div>
        your transactions
      </q-card-actions>
      <q-inner-loading :showing="serverProcessing">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog v-model="splitTickerDialogShow" position="bottom">
    <q-card class="bg-info">
      <q-card-section class="row no-wrap q-pb-none" dense>
        <div class="q-mt-sm">Split of {{ ticker }}</div>
        <q-space />
        <q-icon
          name="close"
          flat
          dense
          @click="closeSplitTickerPopup()"
          class="cursor-pointer"
          ><q-tooltip class="bg-indigo">Close</q-tooltip></q-icon
        >
      </q-card-section>
      <q-separator />
      <q-card-section class="row no-wrap">
        <q-input
          hint="Ratio from"
          dense
          autofocus
          class="q-ma-sm"
          type="number"
          v-model="ratioFrom"
        >
        </q-input>
        <q-input
          hint="Ratio To"
          dense
          autofocus
          class="q-ma-sm"
          type="number"
          v-model="ratioTo"
        >
        </q-input
        ><q-icon
          name="edit"
          size="sm"
          @click="doSplit()"
          class="cursor-pointer q-mt-sm"
          ><q-tooltip class="bg-indigo"
            >Split with ratio of {{ ratioFrom }}/ {{ ratioTo }}</q-tooltip
          ></q-icon
        >
      </q-card-section>
      <q-card-actions>
        * this action will change {{ ticker }} in
        <div class="text-weight-bold">&nbsp;ALL&nbsp;</div>
        your transactions
      </q-card-actions>
      <q-inner-loading :showing="serverProcessing">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="addPurchaseDialogShow"
    position="bottom"
    @hide="resetNewTransaction()"
  >
    <q-card class="bg-info">
      <q-form @submit="submitNewTransaction">
        <q-card-section class="row no-wrap q-pb-none" dense>
          <div class="q-mt-sm">
            Add transaction to {{ ticker }} in portfolio
          </div>
          <q-select
            dense
            class="q-ml-sm"
            v-model="newTransactionPortfolio"
            :value="newTransactionPortfolio"
            :options="store.portfolios"
            use-input
            fill-input
            hide-selected
            @input-value="setNewPortfolio"
            :rules="[
              (val) =>
                (val &&
                  val.length > 0 &&
                  val.toLowerCase() !== 'all portfolios') ||
                'Portfolio name is missing',
              (val) =>
                (val && !val.includes('/') && !val.includes('\\')) ||
                'Don\'t use \\ or / in portfolio name',
            ]"
          />
          <q-space />
          <q-icon
            name="close"
            flat
            dense
            @click="closePurchasePopup()"
            class="cursor-pointer"
            ><q-tooltip class="bg-indigo">Close</q-tooltip></q-icon
          >
        </q-card-section>
        <q-separator />
        <q-card-section class="row no-wrap">
          <q-input
            dense
            readonly
            hint="When"
            mask="####-##-##"
            v-model="newTransactionWhen"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="newTransactionWhen"
                    mask="YYYY-MM-DD"
                    today-btn
                    :options="eventOptions"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="row no-wrap justify-between">
          <q-input
            dense
            style="width: 125px"
            v-model.number="newTransactionShares"
            @keyup="sharesChange"
            @change="sharesChange"
            type="number"
            step="0.0001"
            hint="Quantity"
            :rules="[(val) => (val && val > 0) || 'Quantity is missing']"
          >
            <q-tooltip class="bg-indigo">
              Negative quantity represents a sell transaction
            </q-tooltip>
          </q-input>

          <q-input
            dense
            style="width: 125px"
            v-model.number="newTransactionSharePrice"
            @keyup="sharePriceChange"
            @change="sharePriceChange"
            type="number"
            step="0.0001"
            hint="Share price"
            :prefix="getCurrencySymbol"
            :rules="[(val) => (val && val > 0) || 'Price is missing']"
          >
            <template v-slot:before>
              <q-icon
                dense
                flat
                name="request_quote"
                @click="getPriceForTransaction()"
                size="xs"
                class="cursor-pointer"
              >
                <q-tooltip class="bg-indigo"
                  >Get price (based on selected date)</q-tooltip
                >
              </q-icon>
            </template>
          </q-input>

          <q-input
            dense
            style="width: 125px"
            v-model.number="newTransactionTotal"
            @keyup="totalChange"
            @change="totalChange"
            type="number"
            step="0.0001"
            hint="Total price"
            :prefix="getCurrencySymbol"
            :rules="[(val) => (val && val > 0) || 'Total is missing']"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            icon="done"
            color="primary"
            flat
            type="submit"
            size="md"
            class="cursor-pointer"
          >
            <q-tooltip class="bg-indigo">Save</q-tooltip>
          </q-btn>
          <q-btn
            icon="delete"
            color="secondary"
            flat
            v-if="editedTransaction"
            @click="deleteTransaction()"
            size="md"
            class="cursor-pointer q-ml-md q-mr-md"
          >
            <q-tooltip class="bg-indigo">Delete</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-form>
      <q-inner-loading :showing="serverProcessing">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import {
  bus,
  getTodayDate,
  showAPIError,
  showNotification,
} from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { stockdivStore } from '../stores/stockdivStore';
import { ITransactionData } from 'src/utils/interfaces/ITransactionData';
import { useRouter } from 'vue-router';
import { ITickerUserData } from 'src/utils/interfaces/ITickerUserData';
import { DividendFrequencyEnum } from 'src/utils/enums/DividendFrequencyEnum';
import { date } from 'quasar';
import { filters } from '../utils/utils';
import axios, { AxiosError } from 'axios';
import { IDividendHistoryData } from 'src/utils/interfaces/IDividendHistoryData';
export default defineComponent({
  name: 'tickerPage',

  setup() {
    const store = stockdivStore();
    function eventOptions(date: string) {
      return date <= getTodayDate(false).replace(/-/g, '/');
    }
    const router = useRouter();
    let tickerDividendsSoFar = ref(0);
    let tickerInvested = ref(0);
    let tickerMarketValue = ref(0);

    return {
      editedTransaction: ref<ITransactionData>(),
      timelineItem: ref(),
      timelineItems: ref<{ title: string; content: string }[]>([]),
      timelineLoading: ref<boolean>(false),
      thumbStyle: ref({
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: '0.75',
      }),
      DividendFrequencyEnum,
      filters,
      ticker: ref<string>(''),
      tickerName: ref<string>(),
      dailyChange: ref<number>(0),
      whatHappenedSinceChart: ref<ApexCharts>(),
      whatHappenedSinceLoading: ref<boolean>(false),
      whatHappenedSinceSeries: ref([
        {
          name: 'Price',
          type: 'line',
          data: [],
        },
        {
          name: 'Dividends',
          type: 'line',
          data: [],
        },
      ]),
      whatHappenedSinceOptions: ref({
        chart: {
          height: 350,
          type: 'line',
          toolbar: {
            show: false,
          },
          animations: {
            enabled: false,
          },
          zoom: {
            enabled: false,
          },
        },
        markers: {
          size: 0,
        },
        colors: ['#ADD8E6', '#00FF00'],
        tooltip: {
          shared: false,
        },
        stroke: {
          width: [2, 5],
          curve: 'straight',
        },
        title: {
          text: 'What happened since your first purchase (up to 10 years)',
          align: 'center',
        },
        dataLabels: {
          enabled: false,
        },
        labels: [],
        xaxis: {
          type: 'datetime',
        },
        yaxis: [
          {
            title: {
              text: 'Price',
            },
            labels: {
              show: true,
              formatter: function (val: number) {
                return filters.formatToCurrency(val);
              },
            },
          },
          {
            opposite: true,
            title: {
              text: 'Dividends',
            },
            labels: {
              show: true,
              formatter: function (val: number) {
                return filters.formatToCurrency(val);
              },
            },
          },
        ],
      }),
      averageIncreaseLoading: ref<boolean>(false),
      yearsProjectionSeries: ref<[{ data: number[] }]>([{ data: [] }]),
      yearsProjectionOptions: ref({
        chart: {
          type: 'bar',
        },
        grid: {
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        tooltip: {
          enabled: false,
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return filters.formatToCurrency(val);
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758'],
          },
        },
        xaxis: {
          categories: [
            new Date().getFullYear() - 1,
            new Date().getFullYear(),
            new Date().getFullYear() + 1,
            new Date().getFullYear() + 2,
            new Date().getFullYear() + 3,
            new Date().getFullYear() + 4,
            new Date().getFullYear() + 5,
          ],
          position: 'bottom',
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          crosshairs: {
            fill: {
              type: 'gradient',
              gradient: {
                colorFrom: '#D8E3F0',
                colorTo: '#BED1E6',
                stops: [0, 100],
                opacityFrom: 0.4,
                opacityTo: 0.5,
              },
            },
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: true,
            formatter: function (val: number) {
              return filters.formatToCurrency(val);
            },
          },
        },
        title: {
          show: true,
          text: '5 years projection',
          align: 'center',
        },
      }),
      tickerUserData: ref<ITickerUserData>({
        notes: '',
        tax: 0,
        portfolio: '',
        ticker: '',
      }),
      roiChartSeries: ref<[{ data: number[] }, { data: number[] }]>([
        { data: [0] },
        { data: [0] },
      ]),
      roiChartOptions: ref({
        chart: {
          type: 'bar',
          stacked: true,
        },
        tooltip: {
          enabled: false,
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return filters.formatToCurrency(val);
          },
          style: {
            fontSize: '12px',
            colors: ['#304758'],
          },
        },
        legend: {
          show: false,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10,
            dataLabels: {
              total: {
                enabled: true,
                formatter: function () {
                  return tickerInvested.value === 0? 0: filters.formatToPercentage(
                    (tickerDividendsSoFar.value / tickerInvested.value) * 100
                  );
                },
                style: {
                  fontSize: '13px',
                  fontWeight: 900,
                },
              },
            },
          },
        },
        yaxis: {
          show: false,
        },
        xaxis: {
          type: 'string',
          categories: ['ROI'],
        },
        fill: {
          opacity: 1,
        },
      }),
      tickerDividendsSoFar,
      tickerInvested,
      tickerMarketValue,
      investmentsChartSeries: ref<[{ data: number[] }]>([
        { data: [0, 0, 0, 0] },
      ]),
      tickerInvestmentsLoading: ref<boolean>(false),
      tickerInfoLoading: ref<boolean>(false),
      tickerAveragePrice: ref<number>(0),
      tickerFrequency: ref<DividendFrequencyEnum>(DividendFrequencyEnum.Other),
      tickerCurrency: ref<string>('USD'),
      tickerPrice: ref<number>(0),
      tickerPortfolio: ref<string>('All Portfolios'),
      allDividendsLoading: ref<boolean>(false),
      dividendData: ref<IDividendHistoryData[]>([]),
      newTransactionPortfolio: ref<string>(''),
      addPurchaseDialogShow: ref<boolean>(false),
      changeTickerDialogShow: ref<boolean>(false),
      newTransactionShares: ref<number>(0),
      newTransactionTotal: ref<number>(0),
      newTransactionSharePrice: ref<number>(0),
      serverProcessing: ref<boolean>(false),
      tickerLogo: ref<string>(''),
      newTransactionWhen: ref<string>(getTodayDate(false)),
      newTicker: ref<string>(''),
      ratioFrom: ref<number>(0),
      ratioTo: ref<number>(0),
      splitTickerDialogShow: ref<boolean>(false),
      userDataDialogShow: ref<boolean>(false),
      investmentsChartOptions: ref({
        chart: {
          type: 'bar',
        },
        colors: [
          (data: { value: number; dataPointIndex: number }) => {
            switch (data.dataPointIndex) {
              case 0:
                return '#55aaff';
              case 1:
                return tickerMarketValue.value < tickerInvested.value
                  ? '#ff4122'
                  : '#72bf6a';
              case 2:
                return tickerMarketValue.value - tickerInvested.value < 0
                  ? '#ff4122'
                  : '#72bf6a';
              case 3:
                return tickerMarketValue.value -
                  tickerInvested.value +
                  tickerDividendsSoFar.value <
                  0
                  ? '#ff4122'
                  : '#72bf6a';
            }
          },
        ],
        grid: {
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        tooltip: {
          enabled: false,
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return filters.formatToCurrency(val);
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758'],
          },
        },
        xaxis: {
          categories: [
            'Invested',
            'Market Value',
            'Profit/Loss',
            'Total Return',
          ],
          position: 'bottom',
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          crosshairs: {
            fill: {
              type: 'gradient',
              gradient: {
                colorFrom: '#D8E3F0',
                colorTo: '#BED1E6',
                stops: [0, 100],
                opacityFrom: 0.4,
                opacityTo: 0.5,
              },
            },
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: true,
            formatter: function (val: number) {
              return filters.formatToCurrency(val);
            },
          },
        },
        title: {
          show: false,
        },
      }),
      store,
      router,
      eventOptions,
    };
  },
  methods: {
    deleteTransaction() {
      this.$q
        .dialog({
          title: 'Delete a transaction',
          message: 'Are you sure?',
          position: 'bottom',
          cancel: true,
        })
        .onOk(() => {
          this.serverProcessing = true;
          this.editedTransaction = {
            portfolio: this.tickerPortfolio,
            ticker: this.ticker,
            currency: this.tickerCurrency,
            shares: this.newTransactionShares,
            sharePrice: this.newTransactionSharePrice,
            when: this.newTransactionWhen,
          };
          api
            .delete('transaction', { data: this.editedTransaction })
            .then(() => {
              showNotification('Transaction was deleted successfully');
              this.editedTransaction = undefined;
              this.addPurchaseDialogShow = false;
              this.runOnLoad();
            })
            .catch((error) => {
              showAPIError(error);
            })
            .finally(() => {
              this.serverProcessing = false;
            });
        });
    },
    editTransaction() {
      if (!this.timelineItem || !this.timelineItem.transaction) return;
      this.newTransactionSharePrice = this.timelineItem.transaction.sharePrice;
      this.newTransactionShares = this.timelineItem.transaction.shares;
      this.newTransactionTotal =
        this.timelineItem.transaction.sharePrice *
        this.timelineItem.transaction.shares;
      this.newTransactionWhen = this.timelineItem.transaction.when.substring(
        0,
        10
      );
      this.editedTransaction = {
        portfolio: this.tickerPortfolio,
        ticker: this.ticker,
        currency: this.tickerCurrency,
        shares: this.newTransactionShares,
        sharePrice: this.newTransactionSharePrice,
        when: this.newTransactionWhen,
      };
      this.addPurchaseDialogShow = true;
    },
    closeUserDataDialog() {
      this.userDataDialogShow = false;
    },
    openUserDataDialog() {
      this.userDataDialogShow = true;
    },
    doSplit() {
      if (this.ratioFrom === 0 || this.ratioTo === 0)
        showNotification('Invalid ratio');
      else if (this.ratioFrom === this.ratioTo)
        showNotification('This is not a split');
      else {
        this.serverProcessing = true;
        const ratio: number = this.ratioTo / this.ratioFrom;
        api
          .patch(`transaction/split/${this.ticker}/${ratio}`)
          .then((response) => {
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              this.splitTickerDialogShow = false;
              showNotification('Ticker was splitted successfully');
              this.runOnLoad();
            }
          })
          .catch((err) => {
            showAPIError(err);
          })
          .finally(() => {
            this.serverProcessing = false;
          });
      }
    },
    resetNewTransaction() {
      this.newTransactionSharePrice = 0;
      this.newTransactionShares = 0;
      this.newTransactionTotal = 0;
      this.newTransactionWhen = getTodayDate(false);
      this.editedTransaction = undefined;
    },
    setNewPortfolio(val: string) {
      this.newTransactionPortfolio = val;
    },
    async getTickerPrice(
      ticker: string,
      currency: string,
      when: string
    ): Promise<number> {
      try {
        let { data } = await api.get(
          `ticker/${ticker}/price?toCurrency=${currency}&ofDate=${when}`
        );
        return data;
      } catch (err) {
        showAPIError(err);
        return 0;
      }
    },
    async getPriceForTransaction() {
      this.serverProcessing = true;
      this.newTransactionSharePrice = await this.getTickerPrice(
        this.ticker,
        this.tickerCurrency,
        this.newTransactionWhen
      );
      this.sharePriceChange();
      this.serverProcessing = false;
    },
    sharePriceChange() {
      if (!this.newTransactionSharePrice) return;
      if (this.newTransactionShares === 0) this.newTransactionShares = 1;
      this.newTransactionTotal =
        Math.round(
          this.newTransactionShares * this.newTransactionSharePrice * 1000
        ) / 1000;
    },
    totalChange() {
      if (!this.newTransactionTotal) return;
      if (this.newTransactionShares === 0) this.newTransactionShares = 1;
      this.newTransactionSharePrice =
        Math.round(
          (this.newTransactionTotal / this.newTransactionShares) * 1000
        ) / 1000;
    },
    sharesChange() {
      if (!this.newTransactionShares) return;
      this.newTransactionTotal =
        Math.round(
          this.newTransactionShares * this.newTransactionSharePrice * 1000
        ) / 1000;
    },
    setNewTicker() {
      if (this.ticker === this.newTicker)
        showNotification("Can't replace a ticker with itself");
      else if (this.newTicker === '') showNotification('New ticker is missing');
      else {
        this.serverProcessing = true;
        api
          .patch(`transaction/change/${this.ticker}/${this.newTicker}`)
          .then((response) => {
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              this.changeTickerDialogShow = false;
              showNotification('Ticker was changed successfully');
              this.router.push({
                path: `/ticker/${this.store.selectedPortfolio}/${this.newTicker}`,
              });
              this.newTicker = '';
            }
          })
          .catch((err) => {
            showAPIError(err);
          })
          .finally(() => {
            this.serverProcessing = false;
          });
      }
    },
    submitUserData() {
      this.serverProcessing = true;
      api
        .post(`ticker/${this.ticker}/${this.tickerPortfolio}/userData`, {
          tax: this.tickerUserData.tax,
          notes: this.tickerUserData.notes,
        })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.userDataDialogShow = false;
            showNotification('Saved successfully');
            this.getTickerUserData();
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.serverProcessing = false;
        });
    },
    submitNewTransaction() {
      const transactions: ITransactionData[] = [];
      transactions.push({
        ticker: this.ticker,
        portfolio: this.newTransactionPortfolio,
        sharePrice: this.newTransactionSharePrice,
        shares: this.newTransactionShares,
        when: `${this.newTransactionWhen}T00:00:00.000Z`,
        currency: this.tickerCurrency,
      });
      this.serverProcessing = true;
      api
        .post('transaction', {
          transactions,
          editedTransaction: this.editedTransaction,
        })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.addPurchaseDialogShow = false;
            showNotification('The transaction was updated successfully');
            bus.emit('transactionChange', {});
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.serverProcessing = false;
        });
    },
    closePurchasePopup() {
      this.addPurchaseDialogShow = false;
    },
    closeSplitTickerPopup() {
      this.splitTickerDialogShow = false;
    },
    closeChangeTickerPopup() {
      this.changeTickerDialogShow = false;
    },
    addPurchase() {
      this.addPurchaseDialogShow = true;
    },
    splitTicker() {
      this.splitTickerDialogShow = true;
    },
    changeTicker() {
      this.changeTickerDialogShow = true;
    },
    getTickerUserData() {
      api
        .get(`ticker/${this.ticker}/${this.tickerPortfolio}/userData`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.tickerUserData = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    runTickerInfoRelatedAPIs() {
      this.tickerInfoLoading = true;
      axios
        .all([
          api.get(`ticker/${this.ticker}/name`),
          api.get(`ticker/${this.ticker}/logo`),
          api.get(`ticker/${this.ticker}/currency`),
          api.get(`ticker/${this.ticker}/${this.tickerPortfolio}/averagePrice`),
          api.get(`ticker/${this.ticker}/frequency`),
          api.get(`ticker/${this.ticker}/dailyChange`),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.tickerName = responses[0].data;
            this.tickerLogo = responses[1].data;
            this.tickerCurrency = responses[2].data;
            this.tickerPrice = await this.getTickerPrice(
              this.ticker,
              this.tickerCurrency,
              date.formatDate(new Date(), 'YYYY-MM-DD')
            );
            this.tickerAveragePrice = responses[3].data;
            this.tickerFrequency = responses[4].data;
            this.dailyChange = responses[5].data;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.tickerInfoLoading = false;
        });
    },
    runTickerInvestmentsRelatedAPIs() {
      this.tickerInvestmentsLoading = true;
      axios
        .all([
          api.get(`ticker/${this.ticker}/${this.tickerPortfolio}/invested`),
          api.get(`ticker/${this.ticker}/${this.tickerPortfolio}/marketValue`),
          api.get(
            `dividend/portfolio/${this.tickerPortfolio}/${this.ticker}/dividendsSoFar`
          ),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.tickerInvested = responses[0].data;
            this.tickerMarketValue = responses[1].data;
            this.tickerDividendsSoFar = responses[2].data;
            this.roiChartSeries[0].data[0] = this.tickerDividendsSoFar;
            this.roiChartSeries[1].data[0] = this.tickerInvested;
            this.investmentsChartSeries[0].data[0] = this.tickerInvested;
            this.investmentsChartSeries[0].data[1] = this.tickerMarketValue;
            this.investmentsChartSeries[0].data[2] =
              this.tickerMarketValue - this.tickerInvested;
            this.investmentsChartSeries[0].data[3] =
              this.tickerMarketValue -
              this.tickerInvested +
              this.tickerDividendsSoFar;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.tickerInvestmentsLoading = false;
        });
    },
    runAverageIncreaseRelatedAPIs() {
      this.averageIncreaseLoading = true;
      axios
        .all([api.get(`dividend/ticker/${this.ticker}/averageIncrease`)])
        .then(
          axios.spread(async (...responses) => {
            const averageIncrease: number = responses[0].data.averageIncrease5y;
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 1)
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 2)
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 3)
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 4)
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 5)
            );
            this.yearsProjectionSeries[0].data.push(
              responses[0].data.dividends1YearBack *
                Math.pow(1 + averageIncrease, 6)
            );
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.averageIncreaseLoading = false;
        });
    },
    runWhatHappenedSinceRelatedAPIs() {
      this.whatHappenedSinceLoading = true;
      axios
        .all([
          api.get(
            `ticker/${this.ticker}/${this.tickerPortfolio}/whatHappenedSince`
          ),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.whatHappenedSinceSeries[0].data = responses[0].data.map(
              (element: [Date, [number, number]]) => element[1][0]
            );
            this.whatHappenedSinceSeries[1].data = responses[0].data.map(
              (element: [Date, [number, number]]) => element[1][1]
            );
            if (this.whatHappenedSinceChart)
              this.whatHappenedSinceChart.updateOptions({
                xaxis: {
                  categories: responses[0].data.map(
                    (element: [Date, [number, number]]) => element[0]
                  ),
                },
              });
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.whatHappenedSinceLoading = false;
        });
    },
    runAllDividendsRelatedAPIs() {
      this.allDividendsLoading = true;
      axios
        .all([api.get(`dividend/ticker/${this.ticker}/all`)])
        .then(
          axios.spread(async (...responses) => {
            this.dividendData = responses[0].data;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.allDividendsLoading = false;
        });
    },
    getIncreaseArrow(value: number): string {
      return value === 0 ? '' : value < 0 ? 'trending_down' : 'trending_up';
    },
    getIncreasePercentColor(value: number): string {
      return value < 0 ? 'text-red' : 'text-green';
    },
    runTimelineRelatedAPIs() {
      this.timelineLoading = true;
      axios
        .all([
          api.get(
            `portfolio/${this.store.selectedPortfolio}/ticker/${this.ticker}/timeline`
          ),
        ])
        .then(
          axios.spread((...responses) => {
            this.timelineItems = responses[0].data;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.timelineLoading = false;
        });
    },
    runOnLoad() {
      this.getTickerUserData();
      this.runTickerInfoRelatedAPIs();
      this.runTickerInvestmentsRelatedAPIs();
      this.runAverageIncreaseRelatedAPIs();
      this.runWhatHappenedSinceRelatedAPIs();
      this.runAllDividendsRelatedAPIs();
      this.runTimelineRelatedAPIs();
    },
  },
  mounted() {
    this.ticker = useRoute().params.ticker as string;
    this.tickerPortfolio = useRoute().params.portfolio as string;
    if (this.tickerPortfolio !== 'All Portfolios')
      this.newTransactionPortfolio =
        this.tickerPortfolio === 'undefined'
          ? 'Portfolio'
          : this.tickerPortfolio;
    else this.newTransactionPortfolio = this.store.portfolios[0];
    this.runOnLoad();
    bus.on('changesInTransactions', this.runOnLoad);
  },
  unmounted() {
    bus.off('changesInTransactions', this.runOnLoad);
  },
  computed: {
    getTickerDataTooltip(): string {
      let notes: string;
      if (!this.tickerUserData.notes) {
        notes = '- No Notes -';
      } else {
        notes = this.tickerUserData.notes;
      }
      let tax: string;
      if (!this.tickerUserData?.tax) {
        tax = 'Tax: N/A, using default';
      } else {
        tax = `Tax: ${filters.formatToPercentage(this.tickerUserData.tax)} `;
      }
      let averagePrice: string;
      if (this.tickerAveragePrice === 0) {
        averagePrice = '';
      } else {
        averagePrice = `Average Price: ${filters.formatToCurrency(
          this.tickerAveragePrice
        )}`;
      }
      let tooltip = `${notes} <br/> ${tax}<br/> Frequency: ${
        this.tickerFrequency
      }<br/>${averagePrice ? averagePrice : ''}`;
      return tooltip;
    },
    getCurrencySymbol(): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.tickerCurrency,
      })
        .format(1)
        .substring(0, 1);
    },
    dailyChangePercentage(): number {
      if (this.tickerPrice - this.dailyChange !== 0) {
        return (this.dailyChange / (this.tickerPrice - this.dailyChange)) * 100;
      } else return 0;
    },
    plPercentage(): number {
      if (this.tickerAveragePrice !== 0) {
        return (
          (Math.abs(this.tickerPrice - this.tickerAveragePrice) /
            this.tickerAveragePrice) *
          100 *
          (this.tickerPrice > this.tickerAveragePrice ? 1 : -1)
        );
      } else return 0;
    },
    getDailyArrow(): string {
      return this.dailyChange < 0 ? 'trending_down' : 'trending_up';
    },
    getArrow(): string {
      return this.tickerPrice - this.tickerAveragePrice < 0
        ? 'trending_down'
        : 'trending_up';
    },
    getDailyChangeColor(): string {
      return this.dailyChange < 0
        ? 'text-subtitle2 text-red q-mt-sm'
        : 'text-subtitle2 text-green q-mt-sm';
    },
    getMarketValueColor(): string {
      return this.tickerPrice - this.tickerAveragePrice < 0
        ? 'text-h6 text-red q-mt-sm row no-wrap justify-center'
        : 'text-h6 text-green q-mt-sm row no-wrap justify-center';
    },
  },
});
</script>
<style>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  opacity: 0;
}

.userDataTooltipFont {
  font-size: 14px;
}
.timeline {
  padding: 2em 0 !important;
}
.timelineFont {
  font-size: 14px !important;
}
.timelineTitleFont {
  font-size: 16px !important;
}
th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
}
</style>
