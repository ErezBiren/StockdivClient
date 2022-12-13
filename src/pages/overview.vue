<template>
  <q-page
    v-if="store.token !== '' && store.portfolios.length > 0"
    style="padding-top: 50px"
  >
    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          ref="portfolioChart"
          :options="portfolioChartOptions"
          :series="portfolioChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="marketValueLoading || dividendsInfoLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <div class="text-h6 q-mt-sm row no-wrap justify-center">
          Dividends so far: {{ filters.formatToCurrency(dividendsSoFar) }}
          <q-icon
            v-if="store.dividendAlerts.length > 0"
            :color="getDividendAlertsIconColor"
            :name="getDividendAlertsIcon"
            class="cursor-pointer q-my-xs q-mx-sm"
            @click="showDividendAlerts()"
          >
            <q-tooltip class="bg-indigo">Dividend Alerts</q-tooltip>
          </q-icon>
          <q-icon
            color="blue"
            name="event_note"
            class="cursor-pointer q-my-xs q-mx-sm"
            @click="gotoYearlyPaymentMatrix()"
          >
            <q-tooltip class="bg-indigo">Yearly payment matrix</q-tooltip>
          </q-icon>
          <q-icon
            color="blue"
            name="event"
            class="cursor-pointer q-my-xs q-mx-sm"
            @click="gotoDividendsThisMonth()"
          >
            <q-tooltip class="bg-indigo">Current month</q-tooltip>
          </q-icon>
        </div>
        <div class="text-h6 q-mt-sm">
          {{ nextDividendInfo }}
        </div>
        <div class="row justify-center no-wrap">
          <div v-for="(ticker, index) in nextDivTickers" v-bind:key="ticker">
            <q-chip
              clickable
              @click="gotoTickerPage(ticker)"
              color="teal"
              class="q-ma-sm"
              text-color="white"
            >
              {{ ticker }} </q-chip
            ><br />
            <q-img
              :src="getTickerIcon(index)"
              style="height: 32px; width: 32px"
            />
            <q-tooltip
              >Next Dividend:
              {{
                filters.formatToCurrency(nextDivTickersAmount[index])
              }}</q-tooltip
            >
          </div>
        </div>
        <div class="row justify-center">
          <apexchart
            type="donut"
            height="200"
            :options="yearChartOptions"
            :series="yearlyChartSeries"
          ></apexchart>
          <apexchart
            type="donut"
            height="200"
            :options="monthChartOptions"
            :series="monthlyChartSeries"
          ></apexchart>
          <apexchart
            type="donut"
            height="200"
            :options="weekChartOptions"
            :series="weeklyChartSeries"
          ></apexchart>
        </div>
      </q-card-section>
      <q-inner-loading :showing="dividendsInfoLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          ref="monthsProjectionChart"
          :options="monthsProjectionChartOptions"
          :series="monthsProjectionChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="monthsProjectionLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          ref="highestIncomeChart"
          :options="highestIncomeChartOptions"
          :series="highestIncomeChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="highestIncomeLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          :options="projectionChartOptions"
          :series="projectionChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="projectionLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="bar"
          height="300"
          :options="roiChartOptions"
          :series="roiChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="dividendsInfoLoading || marketValueLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="donut"
          height="300"
          ref="diversificationChart"
          :options="diversificationChartOptions"
          :series="diversificationChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="diversificationLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <apexchart
          type="line"
          height="300"
          ref="performanceChart"
          :options="performanceChartOptions"
          :series="performanceChartSeries"
        ></apexchart>
      </q-card-section>
      <q-inner-loading :showing="PerformanceLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>

    <q-card class="text-center q-ma-md q-mb-lg shadow-8 bg-light-blue-1">
      <q-card-section>
        <q-toggle
          dense
          v-model="showDivs"
          label="Show Dividends"
          class="q-ma-none q-pa-none"
          @click="toggleShowDividends"
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
            :clickable="true"
            @click="clickTimeLineTicker()"
          />
        </q-scroll-area>
      </q-card-section>
      <q-inner-loading :showing="timelineLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
    <q-page-sticky position="top">
      <div class="shadow-8 q-pa-sm bg-light-blue-1 text-center">
        <div class="text-h5 row no-wrap justify-center">
          {{ store.selectedPortfolio }}<q-separator vertical class="q-mx-md" />
          <q-icon
            color="blue"
            name="account_balance_wallet"
            class="cursor-pointer q-my-xs q-ml-sm"
            @click="gotoPortfolio()"
          >
            <q-tooltip class="bg-indigo">Show assets</q-tooltip>
          </q-icon>
          <q-icon
            color="blue"
            name="filter_list"
            class="cursor-pointer q-my-xs q-ml-sm"
            @click="gotoScreener()"
          >
            <q-tooltip class="bg-indigo">Show screener</q-tooltip>
          </q-icon>
        </div>
        <q-separator />
        <div :class="getMarketValueColor">
          {{ filters.formatToCurrency(portfolioMarketValue) }} (<q-icon
            class="q-mr-xs"
            :name="getArrow"
          />{{ filters.formatToPercentage(plPercentage) }})
        </div>
        <div :class="getDailyChangeColor">
          Daily PL: {{ filters.formatToCurrency(dailyChange) }} (<q-icon
            class="q-mr-xs"
            :name="getDailyArrow"
          />{{ filters.formatToPercentage(dailyChangePercentage) }})
        </div>
      </div>
      <q-inner-loading :showing="marketValueLoading || dividendsInfoLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import { IDiversification } from 'src/utils/interfaces/IDiversification';
import { IPriceAndDate } from 'src/utils/interfaces/IPriceAndDate';
import { showAPIError, bus } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { filters } from '../utils/utils';
import { useRouter } from 'vue-router';
import { IDividendAlert } from 'src/utils/interfaces/IDividendAlert';
import { ITransactionData } from 'src/utils/interfaces/ITransactionData';

export default defineComponent({
  name: 'overView',
  setup() {
    const router = useRouter();
    const store = stockdivStore();
    let portfolioMarketValue = ref(0);
    let portfolioInvested = ref(0);
    let dividendsSoFar = ref(0);
    return {
      timelineItem: ref(),
      store,
      showDivs: ref<boolean>(false),
      router,
      filters,
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
            fontSize: '1em',
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
                  return portfolioInvested.value === 0
                    ? 0
                    : filters.formatToPercentage(
                        (dividendsSoFar.value / portfolioInvested.value) * 100
                      );
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
      timelineItems: ref<
        { title: string; content: string; transaction?: ITransactionData }[]
      >([]),
      timelineItemsToShow: ref<
        { title: string; content: string; transaction?: ITransactionData }[]
      >([]),

      timelineLoading: ref<boolean>(false),
      monthsProjectionChart: ref<ApexCharts>(),
      monthsProjectionLoading: ref<boolean>(false),
      monthsProjectionChartSeries: ref<[{ data: number[] }]>([{ data: [] }]),
      monthsProjectionChartOptions: ref({
        chart: {
          type: 'bar',
        },
        title: {
          show: true,
          text: '12 months projection',
          align: 'center',
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
            colors: ['#304758'],
          },
        },
        xaxis: {
          categories: [],
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
      }),
      highestIncomeLoading: ref<boolean>(false),
      highestIncomeChartSeries: ref<[{ data: number[] }]>([{ data: [] }]),
      highestIncomeChartOptions: ref({
        chart: {
          type: 'bar',
        },
        title: {
          show: true,
          text: 'Highest income tickers',
          align: 'center',
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
            colors: ['#304758'],
          },
        },
        xaxis: {
          categories: [],
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
      }),
      portfolioMarketValue,
      portfolioInvested,
      dividendsSoFar,
      nextDividendInfo: ref<string>(''),
      nextDivTickers: ref<string[]>([]),
      nextDivTickersLogos: ref<string[]>([]),
      nextDivTickersAmount: ref<number[]>([]),
      marketValueLoading: ref<boolean>(false),
      PerformanceLoading: ref<boolean>(false),
      dividendsInfoLoading: ref<boolean>(false),
      dailyChange: ref<number>(0),
      diversificationChart: ref<ApexCharts>(),
      highestIncomeChart: ref<ApexCharts>(),
      portfolioChart: ref<ApexCharts>(),
      performanceChart: ref<ApexCharts>(),
      thumbStyle: ref({
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: '0.75',
      }),
      performanceChartOptions: ref({
        chart: {
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2,
          },
          toolbar: {
            show: true,
          },
          animations: {
            enabled: true,
          },
          zoom: {
            enabled: false,
          },
        },
        colors: ['#77B6EA', '#A1EA77'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        title: {
          align: 'center',
          text: `${store.selectedPortfolio} vs S&P500`,
        },
        markers: {
          size: 1,
        },
        xaxis: {
          type: 'datetime',
          categories: [],
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        yaxis: {
          title: {
            show: false,
          },
          labels: {
            formatter: function (val: number) {
              return filters.formatToPercentage(val);
            },
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5,
        },
      }),
      diversificationChartOptions: ref({
        tooltip: {
          enabled: false,
        },
        chart: {
          toolbar: {
            show: true,
          },
        },
        title: {
          show: true,
          align: 'center',
          text: 'Diversification',
        },
        legend: {
          show: false,
        },
        colors: [
          '#90EE90',
          '#ADD8E6',
          '#CBC3E3',
          '#29008b',
          '#89d74d',
          '#bef0d2',
          '#9179b3',
          '#466c8e',
          '#add06c',
          '#aee104',
          '#14f8b0',
          '#361ae0',
          '#f5e28f',
          '#c45201',
          '#f59095',
          '#ecdc68',
          '#6a0553',
          '#94aa32',
          '#a43afa',
          '#adc181',
        ],
        labels: [],
        fill: {
          type: 'gradient',
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['black', 'black', 'black'],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (val: number, opt: any) {
            return filters.formatToPercentage(
              opt.w.config.series[opt.seriesIndex]
            );
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                },
                value: {
                  show: true,
                  formatter: function (val: number) {
                    return filters.formatToPercentage(Number(val));
                  },
                },
                total: {
                  show: false,
                  showAlways: false,
                },
              },
            },
          },
        },
      }),
      weekChartOptions: ref({
        tooltip: {
          enabled: true,
          y: {
            formatter: function (value: number) {
              return filters.formatToCurrency(value);
            },
          },
        },
        colors: ['#90EE90', '#ADD8E6', '#CBC3E3'],
        labels: ['Received', 'Remain', 'Projected'],
        fill: {
          type: 'gradient',
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['black', 'black', 'black'],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (val: number, opt: any) {
            return filters.formatToCurrency(
              opt.w.config.series[opt.seriesIndex]
            );
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                },
                value: {
                  show: true,
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Week',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter: function (w: any) {
                    return filters.formatToCurrency(
                      w.globals.seriesTotals.reduce((a: number, b: number) => {
                        return a + b;
                      }, 0)
                    );
                  },
                },
              },
            },
          },
        },
      }),
      monthChartOptions: ref({
        tooltip: {
          enabled: true,
          y: {
            formatter: function (value: number) {
              return filters.formatToCurrency(value);
            },
          },
        },
        legend: {
          show: false,
        },
        colors: ['#90EE90', '#ADD8E6', '#CBC3E3'],
        labels: ['Received', 'Remain', 'Projected'],
        fill: {
          type: 'gradient',
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['black', 'black', 'black'],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (val: number, opt: any) {
            return filters.formatToCurrency(
              opt.w.config.series[opt.seriesIndex]
            );
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                },
                value: {
                  show: true,
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Month',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter: function (w: any) {
                    return filters.formatToCurrency(
                      w.globals.seriesTotals.reduce((a: number, b: number) => {
                        return a + b;
                      }, 0)
                    );
                  },
                },
              },
            },
          },
        },
      }),
      yearChartOptions: ref({
        tooltip: {
          enabled: true,
          y: {
            formatter: function (value: number) {
              return filters.formatToCurrency(value);
            },
          },
        },
        colors: ['#90EE90', '#ADD8E6', '#CBC3E3'],
        labels: ['Received', 'Remain', 'Projected'],
        fill: {
          type: 'gradient',
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['black', 'black', 'black'],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (val: number, opt: any) {
            return filters.formatToCurrency(
              opt.w.config.series[opt.seriesIndex]
            );
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                },
                value: {
                  show: true,
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Year',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter: function (w: any) {
                    return filters.formatToCurrency(
                      w.globals.seriesTotals.reduce((a: number, b: number) => {
                        return a + b;
                      }, 0)
                    );
                  },
                },
              },
            },
          },
        },
      }),
      yearlyChartSeries: ref<number[]>([]),
      monthlyChartSeries: ref<number[]>([]),
      weeklyChartSeries: ref<number[]>([]),
      diversificationChartSeries: ref<number[]>([]),
      diversificationChartLabels: ref<string[]>([]),
      averageIncrease5y: ref<number>(0),
      averageIncrease10y: ref<number>(0),
      projectionLoading: ref<boolean>(false),
      diversificationLoading: ref<boolean>(false),
      projectionChartSeries: ref<[{ data: number[] }]>([{ data: [] }]),
      performanceChartSeries: ref<{ name: string; data: number[] }[]>([
        { name: '', data: [] },
      ]),
      portfolioChartSeries: ref<[{ data: number[] }]>([{ data: [0, 0, 0, 0] }]),
      portfolioChartOptions: ref({
        chart: {
          type: 'bar',
        },
        colors: [
          (data: { value: number; dataPointIndex: number }) => {
            switch (data.dataPointIndex) {
              case 0:
                return '#55aaff';
              case 1:
                return portfolioMarketValue.value < portfolioInvested.value
                  ? '#ff4122'
                  : '#72bf6a';
              case 2:
                return portfolioMarketValue.value - portfolioInvested.value < 0
                  ? '#ff4122'
                  : '#72bf6a';
              case 3:
                return portfolioMarketValue.value -
                  portfolioInvested.value +
                  dividendsSoFar.value <
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
      projectionChartOptions: ref({
        chart: {
          type: 'bar',
        },
        title: {
          show: true,
          text: '10 years projection',
          align: 'center',
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
            new Date().getFullYear() + 6,
            new Date().getFullYear() + 7,
            new Date().getFullYear() + 8,
            new Date().getFullYear() + 9,
            new Date().getFullYear() + 10,
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
      }),
    };
  },
  methods: {
    toggleShowDividends() {
      if (this.showDivs) this.timelineItemsToShow = this.timelineItems;
      else
        this.timelineItemsToShow = this.timelineItems.filter(
          (item) => item.transaction
        );
    },
    gotoPortfolio() {
      this.router.push({ path: '/portfolio' });
    },
    gotoScreener() {
      this.router.push({ path: '/screener' });
    },
    gotoYearlyPaymentMatrix() {
      this.router.push({ path: '/yearlyPaymentMatrix' });
    },
    gotoDividendsThisMonth() {
      this.router.push({
        path: `/monthlyDividendsView/${new Date().toLocaleString('default', {
          month: 'long',
        })}`,
      });
    },
    showDividendAlerts() {
      this.router.push({ path: '/dividendAlerts' });
    },
    clickTimeLineTicker() {
      if (!this.timelineItem) return;
      this.gotoTickerPage(this.timelineItem.ticker);
    },
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${ticker}`,
      });
    },
    getTickerIcon(index: number) {
      return this.nextDivTickersLogos[index];
    },
    runPortfolioRelatedAPIs() {
      this.marketValueLoading = true;
      axios
        .all([
          api.get(`portfolio/${this.store.selectedPortfolio}/marketValue`),
          api.get(`portfolio/${this.store.selectedPortfolio}/invested`),
          api.get(`portfolio/${this.store.selectedPortfolio}/dailyChange`),
        ])
        .then(
          axios.spread((...responses) => {
            this.portfolioMarketValue = responses[0].data;
            this.portfolioInvested = responses[1].data;
            this.roiChartSeries[0].data[0] = this.dividendsSoFar;
            this.roiChartSeries[1].data[0] = this.portfolioInvested;
            this.dailyChange = responses[2].data;
            this.portfolioChartSeries[0].data[0] = this.portfolioInvested;
            this.portfolioChartSeries[0].data[1] = this.portfolioMarketValue;
            this.portfolioChartSeries[0].data[2] =
              this.portfolioMarketValue - this.portfolioInvested;
            this.portfolioChartSeries[0].data[3] =
              this.portfolioMarketValue -
              this.portfolioInvested +
              this.dividendsSoFar;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.marketValueLoading = false;
        });
    },
    runDividendsRelatedAPIs() {
      this.dividendsInfoLoading = true;
      axios
        .all([
          api.get(`dividend/portfolio/${this.store.selectedPortfolio}/soFar`),
          api.get(`dividend/portfolio/${this.store.selectedPortfolio}/next`),
          api.get(`dividend/portfolio/${this.store.selectedPortfolio}/periods`),
          api.get(`dividend/portfolio/${this.store.selectedPortfolio}/alerts`),
        ])
        .then(
          axios.spread((...responses) => {
            this.dividendsSoFar = responses[0].data;
            this.portfolioChartSeries[0].data[3] =
              this.portfolioMarketValue -
              this.portfolioInvested +
              this.dividendsSoFar;
            this.roiChartSeries[0].data[0] = this.dividendsSoFar;
            this.roiChartSeries[1].data[0] = this.portfolioInvested;

            if (responses[1].data.days === -1)
              this.nextDividendInfo = 'Nothing in the next 31 days...';
            else if (responses[1].data.days === 0)
              this.nextDividendInfo = `Today you should get ${filters.formatToCurrency(
                responses[1].data.amount
              )}`;
            else if (responses[1].data.days === 1)
              this.nextDividendInfo = `Tomorrow you should get ${filters.formatToCurrency(
                responses[1].data.amount
              )}`;
            else
              this.nextDividendInfo = `In ${
                responses[1].data.days
              } days you should get ${filters.formatToCurrency(
                responses[1].data.amount
              )}`;
            this.nextDivTickers = responses[1].data.tickers;
            this.nextDivTickersLogos = responses[1].data.logos;
            this.nextDivTickersAmount = responses[1].data.amounts;

            this.yearlyChartSeries = responses[2].data.yearDividend;
            this.monthlyChartSeries = responses[2].data.monthDividend;
            this.weeklyChartSeries = responses[2].data.weekDividend;

            this.store.dividendAlerts = responses[3].data;
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.dividendsInfoLoading = false;
        });
    },
    runProjectionRelatedAPIs() {
      this.projectionLoading = true;
      axios
        .all([
          api.get(
            `dividend/portfolio/${this.store.selectedPortfolio}/averageIncrease`
          ),
          api.get(
            `dividend/portfolio/${this.store.selectedPortfolio}/incomeLastYear`
          ),
        ])
        .then(
          axios.spread((...responses) => {
            this.averageIncrease10y = responses[0].data.averageIncrease10y;
            this.averageIncrease5y = responses[0].data.averageIncrease5y;
            let incomeLastYear: number = responses[1].data;
            this.projectionChartSeries[0].data = [];
            for (let i = 0; i < 12; i++) {
              this.projectionChartSeries[0].data.push(
                incomeLastYear *
                  (1 +
                    (i < 5 ? this.averageIncrease5y : this.averageIncrease10y))
              );
              incomeLastYear *=
                1 + (i < 5 ? this.averageIncrease5y : this.averageIncrease10y);
            }
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.projectionLoading = false;
        });
    },
    runDiversificationRelatedAPIs() {
      this.diversificationLoading = true;
      axios
        .all([api.get(`portfolio/${this.store.selectedPortfolio}/diversity`)])
        .then(
          axios.spread((...responses) => {
            if (this.diversificationChart)
              this.diversificationChart.updateOptions({
                labels: responses[0].data.map(
                  (item: IDiversification) => item.sector
                ),
              });
            this.diversificationChartSeries = responses[0].data.map(
              (item: IDiversification) => item.percentage
            );
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.diversificationLoading = false;
        });
    },
    runPerformanceRelatedAPIs() {
      this.PerformanceLoading = true;
      axios
        .all([api.get(`portfolio/${this.store.selectedPortfolio}/performance`)])
        .then(
          axios.spread((...responses) => {
            if (this.performanceChart)
              this.performanceChart.updateOptions({
                xaxis: {
                  categories: responses[0].data.sp500.map(
                    (item: IPriceAndDate) => item.valueDate
                  ),
                },
              });
            this.performanceChartSeries = [
              {
                name: 'S&P500',
                data: responses[0].data.sp500.map(
                  (item: IPriceAndDate) => item.value
                ),
              },
              {
                name: 'Your portfolio',
                data: responses[0].data.thePortfolio.map(
                  (item: IPriceAndDate) => item.value
                ),
              },
            ];
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.PerformanceLoading = false;
        });
    },
    runTimelineRelatedAPIs() {
      this.timelineLoading = true;
      axios
        .all([api.get(`portfolio/${this.store.selectedPortfolio}/timeline`)])
        .then(
          axios.spread((...responses) => {
            this.timelineItems = responses[0].data;
            if (this.store.settings.dateFormat != 'YYYY-MM-DD') {
              this.timelineItems.forEach(
                (element: {
                  title: string;
                  content: string;
                  transaction?: ITransactionData;
                }) => {
                  element.title = filters.formatToDate(element.title);
                }
              );
            }
            this.toggleShowDividends();
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.timelineLoading = false;
        });
    },
    runHighestIncomeRelatedAPIs() {
      this.highestIncomeLoading = true;
      axios
        .all([
          api.get(`portfolio/${this.store.selectedPortfolio}/highestIncome`),
        ])
        .then(
          axios.spread((...responses) => {
            this.highestIncomeChartSeries[0].data = responses[0].data.map(
              (item: [string, number]) => item[1]
            );
            if (this.highestIncomeChart)
              this.highestIncomeChart.updateOptions({
                xaxis: {
                  categories: responses[0].data.map(
                    (item: [string, number]) => item[0]
                  ),
                },
              });
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.highestIncomeLoading = false;
        });
    },
    runMonthsProjectionRelatedAPIs() {
      this.monthsProjectionLoading = true;
      axios
        .all([
          api.get(
            `dividend/portfolio/${this.store.selectedPortfolio}/monthsProjection`
          ),
        ])
        .then(
          axios.spread((...responses) => {
            this.monthsProjectionChartSeries[0].data = responses[0].data.map(
              (item: [string, number]) => item[1]
            );
            if (this.monthsProjectionChart)
              this.monthsProjectionChart.updateOptions({
                xaxis: {
                  categories: responses[0].data.map(
                    (item: [string, number]) => item[0]
                  ),
                },
              });
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.monthsProjectionLoading = false;
        });
    },
    runWhenHasTransactions() {
      this.runPortfolioRelatedAPIs();
      this.runDividendsRelatedAPIs();
      this.runProjectionRelatedAPIs();
      this.runDiversificationRelatedAPIs();
      this.runPerformanceRelatedAPIs();
      this.runTimelineRelatedAPIs();
      this.runHighestIncomeRelatedAPIs();
      this.runMonthsProjectionRelatedAPIs();
    },
  },
  computed: {
    getDividendAlertsIconColor(): string {
      return this.store.dividendAlerts.length === 0 ||
        this.store.dividendAlerts.filter(
          (item: IDividendAlert) => item.redFlag === 1
        ).length === 0
        ? 'blue'
        : 'red';
    },
    getDividendAlertsIcon(): string {
      return this.store.dividendAlerts.length === 0 ||
        this.store.dividendAlerts.filter(
          (item: IDividendAlert) => item.redFlag === 1
        ).length === 0
        ? 'notifications'
        : 'notifications_active';
    },
    dailyChangePercentage(): number {
      if (this.portfolioMarketValue - this.dailyChange !== 0) {
        return (
          (this.dailyChange / (this.portfolioMarketValue - this.dailyChange)) *
          100
        );
      } else return 0;
    },
    plPercentage(): number {
      if (this.portfolioInvested !== 0) {
        return (
          (Math.abs(this.portfolioMarketValue - this.portfolioInvested) /
            this.portfolioInvested) *
          100 *
          (this.portfolioMarketValue > this.portfolioInvested ? 1 : -1)
        );
      } else return 0;
    },
    getDailyArrow(): string {
      return this.dailyChange < 0 ? 'trending_down' : 'trending_up';
    },
    getArrow(): string {
      return this.portfolioMarketValue - this.portfolioInvested < 0
        ? 'trending_down'
        : 'trending_up';
    },
    getDailyChangeColor(): string {
      return this.dailyChange < 0
        ? 'text-subtitle2 text-red'
        : 'text-subtitle2 text-green';
    },
    getMarketValueColor(): string {
      return this.portfolioMarketValue - this.portfolioInvested < 0
        ? 'text-h6 text-red q-mt-sm'
        : 'text-h6 text-green q-mt-sm';
    },
    calculateTotalReturn(): number {
      return (
        this.portfolioMarketValue - this.portfolioInvested + this.dividendsSoFar
      );
    },
  },
  mounted() {
    this.runWhenHasTransactions();
    bus.on('changedPortfolio', this.runWhenHasTransactions);
    bus.on('changedSettings', this.runWhenHasTransactions);
  },
  unmounted() {
    bus.off('changedPortfolio', this.runWhenHasTransactions);
    bus.off('changedSettings', this.runWhenHasTransactions);
  },
});
</script>
<style>
.timeline {
  padding: 2em 0 !important;
}
.timelineFont {
  font-size: 0.85em !important;
}
.timelineTitleFont {
  font-size: 1em !important;
}
</style>
