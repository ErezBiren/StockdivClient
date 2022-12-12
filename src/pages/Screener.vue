<template>
  <q-page class="column">
    <q-virtual-scroll
      virtual-scroll-slice-size="10"
      :items="screenerTickers"
      class="col absolute-full scroll q-pt-lg"
      v-slot="{ item, index }"
    >
      <q-card
        class="text-center shadow-8 bg-light-blue-1 q-ma-md"
        v-bind:key="index"
      >
        <q-card-section>
          <div class="row no-wrap cursor-pointer justify-center text-h6">
            <q-img
              class="q-mx-sm q-mt-sm"
              :src="item.logoUrl"
              style="height: 16px; width: 16px"
            />
            <div @click="gotoTickerPage(item.ticker)">
              {{ item.ticker }}: {{ item.name.substring(0, 30) }} ({{
                item.sector
              }})
            </div>
            <q-icon
              class="q-ml-md q-mt-sm cursor-pointer"
              name="delete"
              size="xs"
              @click="deleteTicker(item.ticker)"
              ><q-tooltip class="bg-indigo">Delete</q-tooltip></q-icon
            >
          </div>
          <q-separator />
          <div class="row no-wrap justify-center">
            <div class="col-6 text-right">
              <b>Share price:</b>
              {{ filters.formatToCurrency(item.sharePrice) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortScreener(SortByEnum.MARKETCAPITAL)"
            >
              <b>Market cap:</b>
              {{
                `${filters.formatToCurrency(
                  item.marketCap / 1000 / 1000 / 1000
                )}B`
              }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.dividendYield != 0 || item.dividendAmount != 0"
          >
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortScreener(SortByEnum.YIELD)"
            >
              <b>Yield:</b>
              {{ filters.formatToPercentage(item.dividendYield) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortScreener(SortByEnum.DIVIDENDAMOUNT)"
            >
              <b>Amount:</b>
              {{ filters.formatToCurrency(item.dividendAmount) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.frequency != 'Other' || item.yearsIncrease > 0"
          >
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortScreener(SortByEnum.FREQUENCY)"
            >
              <b>Frequency:</b>
              {{ item.frequency }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortScreener(SortByEnum.YEARS)"
            >
              <b>Years increase:</b> {{ item.yearsIncrease }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.lastExDay != '' || item.lastPayDay != ''"
          >
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortScreener(SortByEnum.EX)"
            >
              <b>Ex:</b> {{ filters.formatToDate(item.lastExDay) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortScreener(SortByEnum.PAY)"
            >
              <b>Pay:</b> {{ filters.formatToDate(item.lastPayDay) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right" @click="sortScreener(SortByEnum.PE)">
              <b>PE:</b> {{ item.pe }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left" @click="sortScreener(SortByEnum.FPE)">
              <b>FPE:</b> {{ item.fpe }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right"
              @click="sortScreener(SortByEnum.LOW52W)"
            >
              <b>52w low:</b> {{ item.low52w }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left"
              @click="sortScreener(SortByEnum.HIGH52W)"
            >
              <b>52w high:</b> {{ item.high52w }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right"
              @click="sortScreener(SortByEnum.PAYOUTRATIO)"
            >
              <b>Payout ratio:</b>
              {{ filters.formatToPercentage(item.payoutRatio) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left"
              @click="sortScreener(SortByEnum.DEBTEQUITY)"
            >
              <b>Debt equity:</b>
              {{ filters.formatToPercentage(item.debtEquity) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.dgr1 != 0 || item.dgr3 != 0"
          >
            <div
              class="col-6 text-right"
              @click="sortScreener(SortByEnum.DGR1)"
            >
              <b>DGR1:</b>
              {{ filters.formatToPercentage(item.dgr1) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left" @click="sortScreener(SortByEnum.DGR3)">
              <b>DGR3:</b> {{ filters.formatToPercentage(item.dgr3) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.dgr5 != 0 || item.dgr10 != 0"
          >
            <div
              class="col-6 text-right"
              @click="sortScreener(SortByEnum.DGR5)"
            >
              <b>DGR5:</b>
              {{ filters.formatToPercentage(item.dgr5) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left"
              @click="sortScreener(SortByEnum.DGR10)"
            >
              <b>DGR10:</b> {{ filters.formatToPercentage(item.dgr10) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right"
              @click="sortScreener(SortByEnum.CCCLIST)"
            >
              <b>ccc List:</b>
              <q-checkbox
                dense
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                v-model="item.cccList"
                disable
              />
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left"
              @click="sortScreener(SortByEnum.INPORTFOLIO)"
            >
              <b>In portfolio:</b>
              <q-checkbox
                dense
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                v-model="item.inPortfolio"
                disable
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-virtual-scroll>
    <q-page-sticky position="top">
      <div class="row q-pa-sm bg-white shadow-8">
        <div class="q-mx-md">{{ screenerTickers.length }} tickers</div>
        <q-separator vertical /><q-icon
          size="xs"
          name="more_vert"
          class="q-mt-xs cursor-pointer"
        >
          <q-menu auto-close fit anchor="bottom left" self="top left">
            <q-list bordered dense separator>
              <q-item clickable v-ripple @click="downloadcccDividends()">
                <q-item-section avatar>
                  <q-icon size="sm" color="primary" name="download" />
                </q-item-section>
                <q-item-section>Get ccc dividends</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="addTicker()">
                <q-item-section avatar>
                  <q-icon size="sm" color="primary" name="add" />
                </q-item-section>
                <q-item-section>Add ticker</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
      </div>
    </q-page-sticky>
    <q-inner-loading :showing="screenerLoading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { SortByEnum } from 'src/utils/enums/SortByEnum';
import { SortDirectionEnum } from 'src/utils/enums/SortDirectionEnum';
import { IScreenerTicker } from 'src/utils/interfaces/IScreenerTicker';
import { defineComponent, ref } from 'vue';
import { bus, filters, showAPIError, showNotification } from '../utils/utils';
import { useRouter } from 'vue-router';
import { stockdivStore } from '../stores/stockdivStore';

export default defineComponent({
  name: 'screenerPage',
  setup() {
    const store = stockdivStore();
    const router = useRouter();
    return {
      filters,
      router,
      store,
      SortByEnum,
      screenerLoading: ref<boolean>(false),
      screenerTickers: ref<IScreenerTicker[]>([]),
      sortBy: ref<SortByEnum>(SortByEnum.YEARS),
      sortDirection: ref<SortDirectionEnum>(SortDirectionEnum.ASC),
    };
  },
  methods: {
    deleteTicker(ticker: string) {
      this.$q
        .dialog({
          title: `Delete ${ticker}`,
          message: 'Are you sure?',
          position: 'bottom',
          cancel: true,
        })
        .onOk(() => {
          api
            .delete(`screener/ticker/${ticker}`)
            .then((response) => {
              if (response.data.error) {
                showNotification(response.data.error);
              } else {
                this.getScreener();
              }
            })
            .catch((err) => {
              showAPIError(err);
            });
        });
    },
    addTicker() {
      showNotification('Search for ticker to add it to the screener');
      setTimeout(() => {
        bus.emit('searchTickerFocus');
      }, 500);
    },
    downloadcccDividends() {
      const notification = setTimeout(() => {
        showNotification('Please wait, this might take a while...');
      }, 3000);

      this.screenerLoading = true;
      api
        .get('screener/cccDividends')
        .then((response) => {
          clearTimeout(notification);
          if (response.data.error) {
            this.screenerLoading = false;
            showNotification(response.data.error);
          } else {
            this.getScreener();
          }
        })
        .catch((err) => {
          clearTimeout(notification);
          this.screenerLoading = false;
          showAPIError(err);
        });
    },
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${ticker}`,
      });
    },
    sortScreener(sortBy: SortByEnum, sortDirection?: SortDirectionEnum) {
      if (sortBy === this.sortBy) {
        this.sortDirection =
          this.sortDirection === SortDirectionEnum.ASC
            ? SortDirectionEnum.DESC
            : SortDirectionEnum.ASC;
      } else this.sortBy = sortBy;
      if (sortDirection) this.sortDirection = sortDirection;
      switch (this.sortBy) {
        case SortByEnum.TICKER: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.ticker.localeCompare(pa2.ticker)
                : pa2.ticker.localeCompare(pa1.ticker)
          );
          break;
        }
        case SortByEnum.DIVIDENDAMOUNT: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendAmount - pa2.dividendAmount
                : pa2.dividendAmount - pa1.dividendAmount
          );
          break;
        }
        case SortByEnum.PAYOUTRATIO: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.payoutRatio - pa2.payoutRatio
                : pa2.payoutRatio - pa1.payoutRatio
          );
          break;
        }
        case SortByEnum.MARKETCAPITAL: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.marketCapital - pa2.marketCapital
                : pa2.marketCapital - pa1.marketCapital
          );
          break;
        }
        case SortByEnum.DGR1: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dgr1 - pa2.dgr1
                : pa2.dgr1 - pa1.dgr1
          );
          break;
        }
        case SortByEnum.DGR3: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dgr3 - pa2.dgr3
                : pa2.dgr3 - pa1.dgr3
          );
          break;
        }
        case SortByEnum.DGR5: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dgr5 - pa2.dgr5
                : pa2.dgr5 - pa1.dgr5
          );
          break;
        }
        case SortByEnum.DGR10: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dgr10 - pa2.dgr10
                : pa2.dgr10 - pa1.dgr10
          );
          break;
        }
        case SortByEnum.DEBTEQUITY: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.debtEquity - pa2.debtEquity
                : pa2.debtEquity - pa1.debtEquity
          );
          break;
        }
        case SortByEnum.CCCLIST: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? Number(pa1.cccList) - Number(pa2.cccList)
                : Number(pa2.cccList) - Number(pa1.cccList)
          );
          break;
        }
        case SortByEnum.INPORTFOLIO: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? Number(pa1.inPortfolio) - Number(pa2.inPortfolio)
                : Number(pa2.inPortfolio) - Number(pa1.inPortfolio)
          );
          break;
        }
        case SortByEnum.PE: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.pe - pa2.pe
                : pa2.pe - pa1.pe
          );
          break;
        }
        case SortByEnum.PE: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.fpe - pa2.fpe
                : pa2.fpe - pa1.fpe
          );
          break;
        }
        case SortByEnum.BETA: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.beta - pa2.beta
                : pa2.beta - pa1.beta
          );
          break;
        }
        case SortByEnum.HIGH52W: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.high52w - pa2.high52w
                : pa2.high52w - pa1.high52w
          );
          break;
        }
        case SortByEnum.LOW52W: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.low52w - pa2.low52w
                : pa2.low52w - pa1.low52w
          );
          break;
        }
        case SortByEnum.DAILYCHANGEPERCENT: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dailyChangePercent - pa2.dailyChangePercent
                : pa2.dailyChangePercent - pa1.dailyChangePercent
          );
          break;
        }
        case SortByEnum.DAILYCHANGE: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dailyChange - pa2.dailyChange
                : pa2.dailyChange - pa1.dailyChange
          );
          break;
        }
        case SortByEnum.FREQUENCY: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendFrequency.localeCompare(pa2.dividendFrequency)
                : pa2.dividendFrequency.localeCompare(pa1.dividendFrequency)
          );
          break;
        }
        case SortByEnum.YEARS: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.yearsIncrease - pa2.yearsIncrease
                : pa2.yearsIncrease - pa1.yearsIncrease
          );
          break;
        }
        case SortByEnum.YIELD: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendYield - pa2.dividendYield
                : pa2.dividendYield - pa1.dividendYield
          );
          break;
        }
        case SortByEnum.EX: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.lastExDay.localeCompare(pa2.lastExDay)
                : pa2.lastExDay.localeCompare(pa1.lastExDay)
          );
          break;
        }
        case SortByEnum.PAY: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.lastPayDay.localeCompare(pa2.lastPayDay)
                : pa2.lastPayDay.localeCompare(pa1.lastPayDay)
          );
          break;
        }
      }
    },
    getScreener() {
      const notification = setTimeout(() => {
        showNotification(
          'You have many transactions, it might take a bit longer than expected...'
        );
      }, 20000);

      this.screenerLoading = true;
      this.screenerTickers = [];
      api
        .get('screener')
        .then((response) => {
          clearTimeout(notification);
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.screenerTickers = response.data;
            if (this.screenerTickers.length === 0) {
              showNotification(
                'Add tickers using the 3 dots menu/search ticker at the top'
              );
            } else
              this.sortScreener(
                this.store.settings.screenerView.sortBy,
                this.store.settings.screenerView.sortDirection
              );
          }
        })
        .catch((err) => {
          clearTimeout(notification);
          showAPIError(err);
        })
        .finally(() => {
          this.screenerLoading = false;
        });
    },
  },
  mounted() {
    bus.on('reloadScreener', this.getScreener);
    bus.on('changedSettings', this.getScreener);
    this.getScreener();
  },
  beforeUnmount() {
    bus.off('reloadScreener', this.getScreener);
    bus.off('changedSettings', this.getScreener);
  },
});
</script>
