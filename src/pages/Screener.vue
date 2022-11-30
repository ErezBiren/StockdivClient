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
              style="height: 16px; max-width: 16px"
            />
            <div @click="gotoTickerPage(item.ticker)">
              {{ item.ticker }}: {{ item.name.substring(0,30) }} ({{ item.sector }})
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
            <div class="col-6 text-left">
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
            <div class="col-6 text-right">
              <b>Yield:</b>
              {{ filters.formatToPercentage(item.dividendYield) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>Amount:</b>
              {{ filters.formatToCurrency(item.dividendAmount) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.frequency != 'Other' || item.yearsIncrease > 0"
          >
            <div class="col-6 text-right">
              <b>Frequency:</b>
              {{ item.frequency }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>Years increase:</b> {{ item.yearsIncrease }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.lastExDay != '' || item.lastPayDay != ''"
          >
            <div class="col-6 text-right">
              <b>Ex:</b> {{ filters.formatToDate(item.lastExDay) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>Pay:</b> {{ filters.formatToDate(item.lastPayDay) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right"><b>PE:</b> {{ item.pe }}</div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left"><b>FPE:</b> {{ item.fpe }}</div>
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right">
              <b>52w low:</b> {{ item.low52w }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>52w high:</b> {{ item.high52w }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right">
              <b>Payout ratio:</b>
              {{ filters.formatToPercentage(item.payoutRatio) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>Debt equity:</b>
              {{ filters.formatToPercentage(item.debtEquity) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.dgr1 != 0 || item.dgr3 != 0"
          >
            <div class="col-6 text-right">
              <b>DGR1:</b>
              {{ filters.formatToPercentage(item.dgr1) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>DGR3:</b> {{ filters.formatToPercentage(item.dgr3) }}
            </div>
          </div>

          <div
            class="row no-wrap justify-center"
            v-if="item.dgr5 != 0 || item.dgr10 != 0"
          >
            <div class="col-6 text-right">
              <b>DGR5:</b>
              {{ filters.formatToPercentage(item.dgr5) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>DGR10:</b> {{ filters.formatToPercentage(item.dgr10) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right">
              <b>ccc Dividends:</b>
              <q-checkbox
                dense
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                v-model="item.cccDividends"
                disable
              />
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
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
        Sort by
        <q-radio
          checked-icon="task_alt"
          val="ticker"
          v-model="sortBy"
          dense
          label="Ticker"
          class="q-mx-md"
          @click="sortScreener()"
        />
        <q-radio
          checked-icon="task_alt"
          val="years"
          v-model="sortBy"
          dense
          label="Years"
          class="q-mx-md"
          @click="sortScreener()"
        />
        <q-separator vertical />
        <q-radio
          checked-icon="task_alt"
          val="ascending"
          v-model="sortDirection"
          dense
          label="Ascending"
          class="q-mx-md"
          @click="sortScreener()"
        />
        <q-radio
          checked-icon="task_alt"
          val="descending"
          v-model="sortDirection"
          dense
          label="Descending"
          class="q-mx-md"
          @click="sortScreener()"
        /><q-separator vertical />
        <div class="q-mx-md">{{ screenerTickers.length }} tickers</div>
        <q-separator vertical /><q-icon
          size="xs"
          name="more_vert"
          class="q-mt-xs cursor-pointer"
        >
          <q-menu fit anchor="bottom left" self="top left" ref="screenerMenu">
            <q-list bordered separator>
              <q-item clickable v-ripple @click="downloadcccDividends()">
                <q-item-section>
                  <q-item-label>Add ccc dividends</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="addTicker()">
                <q-item-section>
                  <q-item-label>Add ticker</q-item-label>
                </q-item-section>
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
import { QMenu } from 'quasar';

export default defineComponent({
  name: 'screenerPage',
  setup() {
    const store = stockdivStore();
    const router = useRouter();
    return {
      filters,
      router,
      store,
      screenerLoading: ref<boolean>(false),
      screenerTickers: ref<IScreenerTicker[]>([]),
      sortBy: ref<SortByEnum>(SortByEnum.YEARS),
      sortDirection: ref<SortDirectionEnum>(SortDirectionEnum.DESC),
      screenerMenu: ref<QMenu>(),
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
      if (this.screenerMenu) this.screenerMenu.hide();
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
          this.screenerLoading = false;
          showAPIError(err);
        });
    },
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${this.store.selectedPortfolio}/${ticker}`,
      });
    },
    sortScreener() {
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
        case SortByEnum.YEARS: {
          this.screenerTickers.sort(
            (pa1: IScreenerTicker, pa2: IScreenerTicker) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.yearsIncrease - pa2.yearsIncrease
                : pa2.yearsIncrease - pa1.yearsIncrease
          );
          break;
        }
      }
    },
    getScreener() {
      this.screenerLoading = true;
      this.screenerTickers = [];
      api
        .get('screener')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.screenerTickers = response.data;
            if (this.screenerTickers.length === 0) {
              showNotification(
                'Add tickers using the 3 dots menu/search ticker at the top'
              );
            } else this.sortScreener();
          }
        })
        .catch((err) => {
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
