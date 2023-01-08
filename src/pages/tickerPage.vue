<template>
  <q-page style="padding-top: 50px">
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
        <div :class="getDifferecePercentColor">
          <q-icon
                  class="q-mr-xs q-mt-xs"
                  size="xs"
                  :name="getIncreaseArrow(percentDifference)"
                />{{ filters.formatToPercentage(percentDifference) }}
        </div>
        <apexchart
          type="line"
          height="300"
          ref="whatHappenedSinceChart"
          :options="whatHappenedSinceOptions"
          :series="whatHappenedSinceSeries"
        ></apexchart>
      </q-card-section>
      <q-card-section>
        <q-option-group
          v-model="period"
          :options="periodOptions"
          dense
          inline
          @update:model-value="changePeriod"
        />
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
                {{ filters.formatToDate(item.exDay.substring(0, 10)) }}
              </td>
              <td>
                {{ filters.formatToDate(item.payDay.substring(0, 10)) }}
              </td>
              <td>
                {{ filters.formatToCurrency(item.amount, tickerCurrency) }}
              </td>
              <td :class="getIncreasePercentColor(item.increasePercent)">
                <q-icon
                  class="q-mr-xs"
                  :name="getIncreaseArrow(item.increasePercent)"
                />{{
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
      <q-inner-loading :showing="allDividendsLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card
      class="text-center q-ma-md shadow-8 bg-light-blue-1"
      v-if="dividendData.length > 0 || tickerInvested > 0"
    >
      <q-card-section>
        <q-toggle
          dense
          v-model="showDivs"
          label="Show Dividends"
          class="q-ma-none q-pa-none"
          @click="toggleShowDividends()"
        />
        <q-scroll-area
          style="height: 280px; max-width: 100%"
          :thumb-style="thumbStyle"
        >
          <vue-horizontal-timeline
            :items="timelineItemsToShow"
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
    <q-page-sticky position="top" style="z-index: 2">
      <div class="shadow-8 q-pa-sm bg-light-blue-1 text-center">
        <div class="row no-wrapd">
          <q-img
            :src="tickerLogo"
            style="height: 24px; width: 24px"
            class="q-mr-sm"
          />
          <strong>{{ ticker }}</strong
          >: {{ tickerName.substring(0, 30) }}&nbsp;
          <q-tooltip
            class="userDataTooltipFont bg-indigo"
            transition-show="rotate"
            transition-hide="rotate"
          >
            <div v-html="getTickerDataTooltip"></div> </q-tooltip
          ><q-space /> <q-separator vertical /><q-icon
            size="xs"
            name="more_vert"
            class="q-mt-xs cursor-pointer"
          >
            <q-menu fit anchor="bottom left" self="top left">
              <q-list bordered dense separator>
                <q-item
                  v-close-popup
                  clickable
                  v-ripple
                  @click="openUserDataDialog()"
                >
                  <q-item-section avatar>
                    <q-icon size="sm" color="primary" name="edit_note" />
                  </q-item-section>
                  <q-item-section>Properties</q-item-section>
                </q-item>
                <q-item v-close-popup clickable v-ripple @click="addPurchase()">
                  <q-item-section avatar>
                    <q-icon
                      size="sm"
                      color="primary"
                      name="add_shopping_cart"
                    />
                  </q-item-section>
                  <q-item-section>Add transaction</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  v-if="tickerInvested > 0"
                  @click="changeTicker()"
                >
                  <q-item-section avatar>
                    <q-icon size="sm" color="primary" name="edit" />
                  </q-item-section>
                  <q-item-section>Change ticker</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  v-if="tickerInvested > 0"
                  @click="splitTicker()"
                >
                  <q-item-section avatar>
                    <q-icon size="sm" color="primary" name="call_split" />
                  </q-item-section>
                  <q-item-section>Split</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  v-if="tickerInvested > 0"
                  @click="closePosition()"
                >
                  <q-item-section avatar>
                    <q-icon
                      size="sm"
                      color="primary"
                      name="cancel_presentation"
                    />
                  </q-item-section>
                  <q-item-section>Close position</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  v-if="
                    tickerInvested > 0 &&
                    store.selectedPortfolio !== 'All Portfolios'
                  "
                >
                  <q-item-section avatar>
                    <q-icon size="sm" color="primary" name="drive_file_move" />
                  </q-item-section>
                  <q-item-section>Move ticker to</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu anchor="top end" self="top start">
                    <q-list>
                      <q-item
                        v-for="portfolio in getPortfoliosList"
                        :key="portfolio"
                        dense
                        clickable
                        v-ripple
                        v-close-popup
                        @click="moveTickerTo(portfolio)"
                      >
                        <q-item-section>{{
                          portfolio === 'All Portfolios'
                            ? '- New Portfolio -'
                            : portfolio
                        }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
              </q-list>
            </q-menu>
          </q-icon>
        </div>
        <q-separator />
        <div :class="getMarketValueColor">
          {{ filters.formatToCurrency(tickerPrice, tickerCurrency) }}
          <div v-if="tickerInvested > 0">
            &nbsp;(<q-icon class="q-mr-xs" :name="getArrow" />{{
              filters.formatToPercentage(plPercentage)
            }})
          </div>
        </div>
        <div :class="getDailyChangeColor">
          Daily PL:
          {{ filters.formatToCurrency(dailyChange, tickerCurrency) }} (<q-icon
            class="q-mr-xs"
            :name="getDailyArrow"
          />{{ filters.formatToPercentage(dailyChangePercentage) }})<q-separator
            vertical
            class="q-mx-sm"
          />
          <div class="text-black">{{ tickerShares }} shares</div>
        </div>
      </div>
      <q-inner-loading :showing="tickerInfoLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-page-sticky>
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
            :rules="[(val) => (val && val !== '') || 'Invalid date']"
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
            </template> </q-input
          ><q-space />
          <q-checkbox
            dense
            label="Is stock dividend?"
            checked-icon="task_alt"
            unchecked-icon="highlight_off"
            v-model="isStockDividend"
            @click="handleStockDividend()"
            ><q-tooltip class="bg-indigo"
              >Adding a stock dividend means the stock has no real
              cost</q-tooltip
            ></q-checkbox
          >
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
            :rules="[(val) => (val && val !== 0) || 'Quantity is missing']"
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
            :disable="isStockDividend"
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
            :disable="isStockDividend"
            type="number"
            step="0.0001"
            hint="Total price"
            :prefix="getCurrencySymbol"
            :rules="[(val) => (val && val !== 0) || 'Total is missing']"
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
import { getCurrencySymbol } from '../utils/utils';
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
    let tickerDividendsSoFar = ref<number>(0);
    let tickerInvested = ref<number>(0);
    let tickerMarketValue = ref<number>(0);
    let tickerCurrency = ref<string>('USD');
    let roiMeterText = ref<string>('');
    return {
      roiMeterText,
      lastAmount: ref<number>(0),
      firstAmount: ref<number>(0),
      firstTransaction: ref<Date>(),
      period: ref<string>('fp'),
      periodOptions: ref([
        {
          label: 'Week',
          value: 'w',
        },
        {
          label: 'Month',
          value: 'm',
        },
        {
          label: 'Year',
          value: 'y',
        },
        {
          label: 'YTD',
          value: 'ytd',
        },
        {
          label: '3Y',
          value: '3y',
        },
        {
          label: '5Y',
          value: '5y',
        },
        {
          label: '10Y',
          value: '10y',
        },
        {
          label: '1st Purchase',
          value: 'fp',
        },
      ]),
      getCurrencySymbol,
      isStockDividend: ref<boolean>(false),
      editedTransaction: ref<ITransactionData>(),
      timelineItem: ref(),
      showDivs: ref<boolean>(false),
      timelineItems: ref<
        { title: string; content: string; transaction?: ITransactionData }[]
      >([]),
      timelineItemsToShow: ref<
        { title: string; content: string; transaction?: ITransactionData }[]
      >([]),
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
      tickerName: ref<string>(''),
      dailyChange: ref<number>(0),
      whatHappenedSinceChart: ref<ApexCharts>(),
      whatHappenedSinceLoading: ref<boolean>(false),
      originalWhatHappenedSinceSeries: ref(),
      whatHappenedSinceSeries: ref([
        {
          name: 'Price',
          type: 'line',
          data: [] as number[],
        },
        {
          name: 'Dividends',
          type: 'line',
          data: [] as number[],
        },
      ]),
      whatHappenedSinceOptions: ref({
        chart: {
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2,
          },
          height: 350,
          type: 'line',
          toolbar: {
            show: true,
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
          shared: true,
          intersect: false,
        },
        stroke: {
          width: [5, 5],
          curve: 'straight',
        },
        title: {
          text: 'What happened since (up to 10 years)',
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
                return filters.formatToCurrency(val, tickerCurrency.value);
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
                return filters.formatToCurrency(val, tickerCurrency.value);
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
            return filters.formatToCurrency(val, tickerCurrency.value);
          },
          offsetY: -20,
          style: {
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
              return filters.formatToCurrency(val, tickerCurrency.value);
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
        tax: undefined,
        portfolio: '',
        ticker: '',
      }),
      roiChartSeries: ref<[{ data: number[] }, { data: number[] }]>([
        { data: [0] },
        { data: [0] },
      ]),
      tickerDividendsSoFar,
      tickerInvested,
      tickerShares: ref<number>(0),
      tickerMarketValue,
      investmentsChartSeries: ref<[{ data: number[] }]>([
        { data: [0, 0, 0, 0] },
      ]),
      tickerInvestmentsLoading: ref<boolean>(false),
      tickerInfoLoading: ref<boolean>(false),
      tickerAveragePrice: ref<number>(0),
      tickerDividendYield: ref<number>(0),
      tickerFrequency: ref<DividendFrequencyEnum>(DividendFrequencyEnum.Other),
      tickerCurrency,
      tickerPrice: ref<number>(0),
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
            return filters.formatToCurrency(val, tickerCurrency.value);
          },
          offsetY: -20,
          style: {
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
              return filters.formatToCurrency(val, tickerCurrency.value);
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
    changePeriod() {
      this.processWhatHappenedSinceData();
    },
    closePosition() {
      this.newTransactionShares = -this.tickerShares;
      this.newTransactionSharePrice = this.tickerPrice;
      this.sharePriceChange();
      this.addPurchaseDialogShow = true;
    },
    handleStockDividend() {
      this.newTransactionSharePrice = 0.01;
      this.newTransactionTotal =
        this.newTransactionSharePrice * this.newTransactionShares;
    },
    processMoveTickerTo(portfolio: string) {
      this.tickerInfoLoading = true;
      api
        .patch(
          `ticker/${this.ticker}/move/${this.store.selectedPortfolio}/${portfolio}`
        )
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            bus.emit('transactionChange');
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.tickerInfoLoading = false;
        });
    },
    moveTickerTo(portfolio: string) {
      if (portfolio === 'All Portfolios') {
        this.$q
          .dialog({
            position: 'bottom',
            title: 'Move ticker to portfolio',
            message: 'Enter portfolio name',
            prompt: {
              model: '',
              isValid: (val: string) =>
                val.length > 0 && val !== 'All Portfolios',
            },
          })
          .onOk((newPortfolio: string) => {
            this.processMoveTickerTo(newPortfolio);
          });
      } else {
        this.processMoveTickerTo(portfolio);
      }
    },
    toggleShowDividends() {
      if (this.showDivs) this.timelineItemsToShow = this.timelineItems;
      else
        this.timelineItemsToShow = this.timelineItems.filter(
          (item) => item.transaction
        );
    },
    deleteTransaction() {
      if (this.store.selectedPortfolio === 'All Portfolios') {
        showNotification("You can't delete a transaction from All Portfolios");
      } else {
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
              portfolio: this.store.selectedPortfolio,
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
                bus.emit('transactionChange');
              })
              .catch((error) => {
                showAPIError(error);
              })
              .finally(() => {
                this.serverProcessing = false;
              });
          });
      }
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
        portfolio: this.store.selectedPortfolio,
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
      this.isStockDividend = false;
    },
    setNewPortfolio(val: string) {
      this.newTransactionPortfolio = val;
    },
    async getTickerPrice(ticker: string, when: string): Promise<number> {
      try {
        let { data } = await api.get(`ticker/${ticker}/price?ofDate=${when}`);
        return data;
      } catch (err) {
        showAPIError(err);
        return 0;
      }
    },
    async getPriceForTransaction() {
      if (this.isStockDividend) return;
      this.serverProcessing = true;
      this.newTransactionSharePrice = await this.getTickerPrice(
        this.ticker,
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
                path: `/ticker/${this.newTicker}`,
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
        .post(
          `ticker/${this.ticker}/${this.store.selectedPortfolio}/userData`,
          {
            tax: this.tickerUserData.tax,
            notes: this.tickerUserData.notes,
          }
        )
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.userDataDialogShow = false;
            showNotification('Properties were saved successfully');
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
      if (
        this.editedTransaction &&
        this.store.selectedPortfolio === 'All Portfolios'
      ) {
        showNotification("You can't add/edit a transaction in All Portfolios");
      } else {
        const transactions: ITransactionData[] = [];
        transactions.push({
          ticker: this.ticker,
          portfolio: this.newTransactionPortfolio,
          sharePrice: this.newTransactionSharePrice,
          shares: this.newTransactionShares,
          when: `${this.newTransactionWhen}`,
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
              bus.emit('transactionChange');
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
        .get(`ticker/${this.ticker}/${this.store.selectedPortfolio}/userData`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else if (response.data) {
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
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/averagePrice`
          ),
          api.get(`ticker/${this.ticker}/frequency`),
          api.get(`ticker/${this.ticker}/dailyChange`),
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/dividendYield`
          ),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.tickerName = responses[0].data;
            this.tickerLogo = responses[1].data;
            this.tickerCurrency = responses[2].data;
            this.tickerPrice = await this.getTickerPrice(
              this.ticker,
              date.formatDate(new Date(), 'YYYY-MM-DD')
            );
            this.tickerAveragePrice = responses[3].data;
            this.tickerFrequency = responses[4].data;
            this.dailyChange = responses[5].data;
            this.tickerDividendYield = responses[6].data;
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
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/invested`
          ),
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/marketValue`
          ),
          api.get(
            `dividend/portfolio/${this.store.selectedPortfolio}/${this.ticker}/dividendsSoFar`
          ),
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/roiMeter`
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
            this.roiMeterText = responses[3].data;
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
            this.yearsProjectionSeries[0].data = [];
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
    processWhatHappenedSinceData() {
      let limit: Date;
      const endDate: Date = date.subtractFromDate(new Date(), { days: 1 });
      if (this.period === 'fp' && !this.firstTransaction) this.period = '10y';
      switch (this.period) {
        case 'w': {
          limit = date.subtractFromDate(endDate, { days: 7 });
          break;
        }
        case 'm': {
          limit = date.subtractFromDate(endDate, { months: 1 });
          break;
        }
        case 'y': {
          limit = date.subtractFromDate(endDate, { years: 1 });
          break;
        }
        case 'ytd': {
          limit = date.startOfDate(endDate, 'year');
          break;
        }
        case '3y': {
          limit = date.subtractFromDate(endDate, { years: 3 });
          break;
        }
        case '5y': {
          limit = date.subtractFromDate(endDate, { years: 5 });
          break;
        }
        case '10y': {
          limit = date.subtractFromDate(endDate, { years: 10 });
          break;
        }
        case 'fp': {
          limit = this.firstTransaction
            ? this.firstTransaction
            : date.subtractFromDate(endDate, { years: 10 });
          break;
        }
      }
      let filtered: [Date, [number, number]][] =
        this.originalWhatHappenedSinceSeries.filter(
          (element: [Date, [number, number]]) =>
            new Date(element[0]).getTime() >= limit.getTime()
        );
      this.lastAmount = filtered[0][1][0]
        ? filtered[0][1][0]
        : filtered[1][1][0];
      this.firstAmount = filtered[filtered.length - 1][1][0];
      this.whatHappenedSinceSeries[0].data = filtered.map(
        (element: [Date, [number, number]]) => element[1][0]
      );
      this.whatHappenedSinceSeries[1].data = filtered.map(
        (element: [Date, [number, number]]) => element[1][1]
      );

      if (this.whatHappenedSinceChart)
        this.whatHappenedSinceChart.updateOptions({
          xaxis: {
            categories: filtered.map(
              (element: [Date, [number, number]]) => element[0]
            ),
          },
        });
    },
    runWhatHappenedSinceRelatedAPIs() {
      this.whatHappenedSinceLoading = true;
      axios
        .all([
          api.get(
            `ticker/${this.ticker}/${this.store.selectedPortfolio}/whatHappenedSince`
          ),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.originalWhatHappenedSinceSeries = responses[0].data;
            this.processWhatHappenedSinceData();
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
            let withTransactions = false;
            this.timelineItems.forEach(
              (element: {
                title: string;
                content: string;
                transaction?: ITransactionData;
              }) => {
                if (this.store.settings.dateFormat !== 'YYYY-MM-DD')
                  element.title = filters.formatToDate(element.title);
                if (element.transaction) {
                  this.firstTransaction = new Date(element.transaction.when);
                  withTransactions = true;
                  this.tickerShares += element.transaction.shares;
                }
              }
            );
            this.showDivs = !withTransactions;
            this.toggleShowDividends();
            this.runWhatHappenedSinceRelatedAPIs();
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
      this.runAllDividendsRelatedAPIs();
      this.runTimelineRelatedAPIs();
    },
  },
  mounted() {
    if (this.store.token === '') {
      showNotification('You will need to re-login');
      this.router.push('/');
    } else {
      this.ticker = useRoute().params.ticker as string;
      if (this.store.selectedPortfolio !== 'All Portfolios')
        this.newTransactionPortfolio =
          this.store.selectedPortfolio === 'undefined'
            ? 'Portfolio'
            : this.store.selectedPortfolio;
      else this.newTransactionPortfolio = this.store.portfolios[0];
      this.runOnLoad();
      bus.on('updateTickerPage', this.runOnLoad);
      bus.on('changedPortfolio', this.runOnLoad);
      bus.on('changedSettings', this.runOnLoad);
    }
  },
  unmounted() {
    bus.off('updateTickerPage', this.runOnLoad);
    bus.off('changedPortfolio', this.runOnLoad);
    bus.off('changedSettings', this.runOnLoad);
  },
  computed: {
    roiChartOptions() {
      return {
        chart: {
          type: 'bar',
          stacked: true,
        },
        tooltip: {
          enabled: false,
        },
        grid: {
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => {
            return filters.formatToCurrency(val, this.tickerCurrency);
          },
          style: {
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
                formatter: () => {
                  return this.tickerInvested === 0
                    ? ''
                    : `${filters.formatToPercentage(
                        (this.tickerDividendsSoFar / this.tickerInvested) * 100
                      )} | Approximately ${this.roiMeterText} to 100% ROI`;
                },
                style: {
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
      };
    },
    getDifferecePercentColor(): string {
      return this.lastAmount < this.firstAmount
        ? 'absolute-top-right q-mr-xl q-mt-md text-red text-weight-bold row no-wrap'
        : 'absolute-top-right q-mr-xl q-mt-md text-green text-weight-bold row no-wrap';
    },
    percentDifference(): number {
      return this.firstAmount === 0
        ? 0
        : ((this.lastAmount - this.firstAmount) / this.firstAmount) * 100;
    },
    getPortfoliosList(): string[] {
      return this.store.portfolios.filter(
        (item: string) => item !== this.store.selectedPortfolio
      );
    },
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
        tax = `Tax: ${filters.formatToPercentage(this.tickerUserData.tax)}`;
      }
      let averagePrice: string;
      if (this.tickerAveragePrice === 0) {
        averagePrice = '';
      } else {
        averagePrice = `Average Price: ${filters.formatToCurrency(
          this.tickerAveragePrice,
          this.tickerCurrency
        )}`;
      }
      let divYield: string;
      if (this.tickerDividendYield === 0) {
        divYield = '';
      } else {
        divYield = `Dividend Yield: ${filters.formatToPercentage(
          this.tickerDividendYield
        )}`;
      }
      let tooltip = `${notes} <br/> ${tax}<br/> Frequency: ${
        this.tickerFrequency
      }${averagePrice ? '<br/>' + averagePrice : ''}${
        divYield ? '<br/>' + divYield : ''
      }`;
      return tooltip;
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
        ? 'text-subtitle2 text-red q-mt-sm row no-wrap'
        : 'text-subtitle2 text-green q-mt-sm row no-wrap';
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
  font-size: 0.85em !important;
}
.timelineTitleFont {
  font-size: 1em !important;
}
th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
}
</style>
