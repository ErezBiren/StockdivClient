<template>
  <q-page class="column" v-if="store.token !== '' && hasTransactions">
    <q-card class="text-center q-ma-md shadow-8">
      <q-card-section>
        <div class="text-h5">Market Value</div>
        <q-separator />
        <div :class="getMarketValueColor">
          {{ filters.formatToCurrency(portfolioMarketValue) }} (<q-icon
            :name="getArrow"
          />{{ filters.formatToPercentage(plPercentage) }})
        </div>
        <div :class="getDailyChangeColor">
          Daily change: {{ filters.formatToCurrency(dailyChange) }} (<q-icon
            :name="getDailyArrow"
          />{{ filters.formatToPercentage(dailyChangePercentage) }})
        </div>
      </q-card-section>
    </q-card>

    <q-card class="text-center q-ma-md shadow-8">
      <q-card-section>
        <div class="text-h5">Dividends</div>
        <q-separator />
        <div class="text-h6 q-mt-sm">
          So far: {{ filters.formatToCurrency(dividendsSoFar) }}
        </div>
        <div class="text-h6 q-mt-sm">
          {{ nextDividendInfo }}
        </div>
        <div class="row justify-center">
          <div v-for="ticker in nextDivTickers" v-bind:key="ticker">
            <q-img
              :src="getTickerIcon(ticker)"
              style="height: 32px; max-width: 32px"
            />
            <q-chip
              clickable
              @click="clickNextDivTicker(ticker)"
              color="teal"
              class="q-ma-sm"
              text-color="white"
            >
              {{ getTicker(ticker) }}
            </q-chip>
          </div>
        </div>
        <div class="row justify-center">
          <apexchart
            type="donut"
            :options="yearChartOptions"
            :series="yearlyChartSeries"
          ></apexchart>
          <apexchart
            type="donut"
            :options="monthChartOptions"
            :series="monthlyChartSeries"
          ></apexchart>
          <apexchart
            type="donut"
            :options="weekChartOptions"
            :series="weeklyChartSeries"
          ></apexchart>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { bus, showAPIError, showNotification } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { filters } from '../utils/utils';

export default defineComponent({
  name: 'overView',
  setup() {
    const store = stockdivStore();
    return {
      store,
      filters,
      hasTransactions: ref<boolean>(false),
      portfolioMarketValue: ref<number>(0),
      portfolioCost: ref<number>(1),
      dividendsSoFar: ref<number>(0),
      nextDividendInfo: ref<string>(''),
      nextDivTickers: ref<string[]>([]),
      dailyChange: ref<number>(0),
      weekChartOptions: ref({
        tooltip: {
          enabled: false,
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
          enabled: false,
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
          enabled: false,
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
      chartLabels: ref<string[]>(['Received', 'Remain', 'Projected']),
    };
  },
  methods: {
    getTicker(ticker: string) {
      if (ticker.includes('https'))
        return ticker.substring(
          ticker.lastIndexOf('/') + 1,
          ticker.lastIndexOf('.')
        );
      else return ticker;
    },
    getTickerIcon(ticker: string) {
      if (ticker.includes('https')) return ticker;
      else return 'https://stockdiv.com/nologo.png';
    },
    clickNextDivTicker(ticker: string) {
      showNotification(`Selected ${ticker}`);
    },
    getPeriodsDividends() {
      api
        .get(`dividend/portfolio/${this.store.selectedPortfolio}/periods`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.yearlyChartSeries = response.data.yearDividend;
            this.monthlyChartSeries = response.data.monthDividend;
            this.weeklyChartSeries = response.data.weekDividend;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getPortfolioDailyChange() {
      api
        .get(`portfolio/${this.store.selectedPortfolio}/dailyChange`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.dailyChange = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getPortfolioMarketValue() {
      api
        .get(`portfolio/${this.store.selectedPortfolio}/marketValue`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.portfolioMarketValue = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getPortfolioCost() {
      api
        .get(`portfolio/${this.store.selectedPortfolio}/cost`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.portfolioCost = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getNextDividendForPortfolio() {
      api
        .get(`dividend/portfolio/${this.store.selectedPortfolio}/next`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            if (response.data.days === -1)
              this.nextDividendInfo = 'Nothing in the next 31 days...';
            else if (response.data.days === 0)
              this.nextDividendInfo = `Today you should get ${filters.formatToCurrency(
                response.data.amount
              )}`;
            else if (response.data.days === 1)
              this.nextDividendInfo = `Tomorrow you should get ${filters.formatToCurrency(
                response.data.result.amount
              )}`;
            else
              this.nextDividendInfo = `In ${
                response.data.days
              } days you should get ${filters.formatToCurrency(
                response.data.amount
              )}`;
            this.nextDivTickers = response.data.tickers;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getDividendsSoFarForPortfolio() {
      api
        .get(`dividend/portfolio/${this.store.selectedPortfolio}/soFar`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.dividendsSoFar = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    runWhenHasTransactions(has: boolean) {
      this.hasTransactions = has;
      if (has) {
        this.getPortfolioMarketValue();
        this.getPortfolioCost();
        this.getDividendsSoFarForPortfolio();
        this.getNextDividendForPortfolio();
        this.getPortfolioDailyChange();
        this.getPeriodsDividends();
      }
    },
  },
  computed: {
    dailyChangePercentage(): number {
      return this.portfolioMarketValue - this.dailyChange !== 0
        ? (this.dailyChange / (this.portfolioMarketValue - this.dailyChange)) *
            100
        : 0;
    },
    plPercentage(): number {
      return (
        (Math.abs(this.portfolioMarketValue - this.portfolioCost) /
          this.portfolioCost) *
        100 *
        (this.portfolioMarketValue > this.portfolioCost ? 1 : -1)
      );
    },
    getDailyArrow(): string {
      return this.dailyChange > 0 ? 'trending_up' : 'trending_down';
    },
    getArrow(): string {
      return this.portfolioMarketValue - this.portfolioCost > 0
        ? 'trending_up'
        : 'trending_down';
    },
    getDailyChangeColor(): string {
      return this.dailyChange < 0
        ? 'text-subtitle2 text-red q-ml-sm q-mt-sm'
        : 'text-subtitle2 text-green q-ml-sm q-mt-sm';
    },
    getMarketValueColor(): string {
      return this.portfolioMarketValue - this.portfolioCost > 0
        ? 'text-h6 text-green q-mt-sm'
        : 'text-h6 text-red q-mt-sm';
    },
  },
  mounted() {
    bus.on('hasTransactions', this.runWhenHasTransactions);
  },
  unmounted() {
    bus.off('hasTransactions', this.runWhenHasTransactions);
  },
});
</script>
