<template>
  <q-page style="padding-top: 50px">
    <q-card
      class="text-center shadow-8 bg-light-blue-1 q-ma-md q-mb-lg"
      v-for="(item, i) in portfolioAssets"
      v-bind:key="i"
    >
      <q-card-section>
        <div
          class="cursor-pointer justify-center"
          @click="gotoTickerPage(item.ticker)"
        >
          <q-img
            class="q-mx-sm"
            :src="item.logoUrl"
            style="height: 16px; max-width: 16px"
          /><b>{{ item.ticker }}</b>: {{ item.sector }}<br/>{{ item.shares.toFixed(2) }} shares of {{ item.name.substring(0,30) }}
        </div>
        
        <div class="row no-wrap justify-center">
          <div :class="getMarketValueColor(item.profitLoss)">
            {{ filters.formatToCurrency(item.marketValue) }}
            &nbsp;(<q-icon
              class="q-mr-xs q-mt-xs"
              :name="getArrow(item.profitLoss)"
            />{{ filters.formatToPercentage(item.profitLossPercent) }})
          </div>
          <div :class="getDailyChangeColor(item.dailyChange)">
            Daily: (<q-icon
              class="q-mr-xs"
              :name="getDailyArrow(item.dailyChange)"
            />{{ filters.formatToPercentage(item.dailyChangePercent) }})
          </div>
        </div>
        
        <div class="text-h6">
          Income: {{ filters.formatToCurrency(item.income) }}
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right">
            <b>Average price:</b>
            {{ filters.formatToCurrency(item.averagePrice) }}
          </div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left">
            <b>Current price:</b>
            {{ filters.formatToCurrency(item.sharePrice) }}
          </div>
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right">
            <b>Yield:</b> {{ filters.formatToPercentage(item.dividendYield) }}
          </div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left">
            <b>YOC:</b> {{ filters.formatToPercentage(item.yoc) }}
          </div>
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right">
            <b>Frequency:</b>
            {{ item.dividendFrequency }}
          </div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left">
            <b>Tax:</b> {{ filters.formatToPercentage(item.tax) }}
          </div>
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right">
            <b>Annualized:</b> {{ filters.formatToPercentage(item.annualized) }}
          </div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left">
            <b>Portion:</b> {{ filters.formatToPercentage(item.portion) }}
          </div>
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right"><b>Ex:</b> {{ filters.formatToDate(item.lastExDay) }}</div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left"><b>Pay:</b> {{ filters.formatToDate(item.lastPayday) }}</div>
        </div>
        
        <div class="row no-wrap justify-center">
          <div class="col-6 text-right">
            <b>Amount:</b> {{ filters.formatToCurrency(item.dividendAmount) }}
          </div>
          <q-separator vertical class="q-mx-md" />
          <div class="col-6 text-left">
            <b>Total:</b> {{ filters.formatToCurrency(item.lastTotalDividend) }}
          </div>
        </div>
      </q-card-section>
    </q-card>
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
          @click="sortAssets()"
        />
        <q-radio
          checked-icon="task_alt"
          val="income"
          v-model="sortBy"
          dense
          label="Income"
          class="q-mx-md"
          @click="sortAssets()"
        />
        <q-radio
          checked-icon="task_alt"
          val="profitloss"
          v-model="sortBy"
          dense
          label="%Profit/Loss"
          class="q-mx-md"
          @click="sortAssets()"
        />
        <q-radio
          checked-icon="task_alt"
          val="dailychange"
          v-model="sortBy"
          dense
          label="%Daily change"
          class="q-mx-md"
          @click="sortAssets()"
        /><q-separator vertical />
        <q-radio
          checked-icon="task_alt"
          val="ascending"
          v-model="sortDirection"
          dense
          label="Ascending"
          class="q-mx-md"
          @click="sortAssets()"
        />
        <q-radio
          checked-icon="task_alt"
          val="descending"
          v-model="sortDirection"
          dense
          label="Descending"
          class="q-mx-md"
          @click="sortAssets()"
        /><q-separator vertical /><div class="q-mx-md">{{ portfolioAssets.length }} assets</div>
      </div>
    </q-page-sticky>
    <q-inner-loading :showing="portfolioLoading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { IPortfolioAsset } from 'src/utils/interfaces/IPortfolioAsset';
import { defineComponent, ref } from 'vue';
import { filters, showAPIError, showNotification } from '../utils/utils';
import { stockdivStore } from '../stores/stockdivStore';
import { SortByEnum } from '../utils/enums/SortByEnum';
import { SortDirectionEnum } from 'src/utils/enums/SortDirectionEnum';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PortfolioPage',
  setup() {
    const router = useRouter();
    const store = stockdivStore();
    return {
      filters,
      router,
      store,
      portfolioLoading: ref<boolean>(false),
      portfolioAssets: ref<IPortfolioAsset[]>([]),
      sortBy: ref<SortByEnum>(SortByEnum.TICKER),
      sortDirection: ref<SortDirectionEnum>(SortDirectionEnum.ASC),
    };
  },
  methods: {
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${this.store.selectedPortfolio}/${ticker}`,
      });
    },
    getPortfolio() {
      this.portfolioLoading = true;
      api
        .get(`portfolio/${this.store.selectedPortfolio}/assets`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.portfolioAssets = response.data;
            this.sortAssets();
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.portfolioLoading = false;
        });
    },
    getMarketValueColor(profitLoss: number): string {
      return profitLoss < 0
        ? 'text-h6 text-red q-mt-sm row no-wrap justify-center'
        : 'text-h6 text-green q-mt-sm row no-wrap justify-center';
    },
    getArrow(profitLoss: number): string {
      return profitLoss < 0 ? 'trending_down' : 'trending_up';
    },
    sortAssets() {
      switch (this.sortBy) {
        case SortByEnum.TICKER: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.ticker.localeCompare(pa2.ticker)
                : pa2.ticker.localeCompare(pa1.ticker)
          );
          break;
        }
        case SortByEnum.INCOME: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.income - pa2.income
                : pa2.income - pa1.income
          );
          break;
        }
        case SortByEnum.PROFITLOSS: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.profitLossPercent - pa2.profitLossPercent
                : pa2.profitLossPercent - pa1.profitLossPercent
          );
          break;
        }
        case SortByEnum.DAILYCHANGE: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dailyChangePercent - pa2.dailyChangePercent
                : pa2.dailyChangePercent - pa1.dailyChangePercent
          );
          break;
        }
      }
    },
    getDailyArrow(dailyChange: number): string {
      return dailyChange < 0 ? 'trending_down' : 'trending_up';
    },
    getDailyChangeColor(dailyChange: number): string {
      return dailyChange < 0
        ? 'text-subtitle2 text-red q-mt-md q-mx-md'
        : 'text-subtitle2 text-green q-mt-md q-mx-md';
    },
  },
  mounted() {
    this.getPortfolio();
  },
});
</script>
