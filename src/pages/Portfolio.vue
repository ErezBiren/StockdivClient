<template>
  <q-page style="padding-top: 50px">
    <div v-if="viewMode === ViewModeEnum.TABLE">
      <q-select
        class="absolute-top-right q-mt-md q-mr-lg"
        dense
        options-dense
        :display-value="$q.lang.table.columns"
        style="z-index: 2; width: 150px"
        v-model="visibleColumns"
        multiple
        emit-value
        map-options
        option-value="name"
        :options="portfolioColumns"
        transition-show="jump-up"
        transition-hide="jump-up"
      />
      <q-table
        dense
        bordered
        ref="portfolioTable"
        class="absolute-full scroll q-ma-md my-sticky-header-column-table shadow-8 bg-light-blue-1"
        :title="store.selectedPortfolio"
        :rows="portfolioAssets"
        :columns="portfolioColumns"
        row-key="ticker"
        v-model:pagination="pagination"
        :visible-columns="visibleColumns"
        :hide-bottom="true"
        :filter="filterClosePositions"
        :filter-method="filterSoldAll"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              class="cursor-pointer row no-wrap"
              key="ticker"
              :props="props"
              @click="gotoTickerPage(props.row.ticker)"
            >
              <q-img
                class="q-mx-sm"
                :src="props.row.logoUrl"
                style="height: 16px; width: 16px"
              />
              <div :class="soldAllColor(props.row.shares)">
                {{ props.row.ticker }}
              </div>
            </q-td>
            <q-td
              key="name"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ props.row.name }}</q-td
            >
            <q-td
              key="sector"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ props.row.sector }}</q-td
            >
            <q-td
              key="shares"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ props.row.shares }}</q-td
            >
            <q-td
              key="averagePrice"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.averagePrice) }}</q-td
            >
            <q-td
              key="sharePrice"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.sharePrice) }}</q-td
            >
            <q-td
              key="invested"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.invested) }}</q-td
            >
            <q-td
              key="marketValue"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.marketValue) }}</q-td
            >
            <q-td
              key="income"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.income) }}</q-td
            >
            <q-td
              key="dividendYield"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.dividendYield) }}</q-td
            >
            <q-td
              key="yoc"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.yoc) }}</q-td
            >
            <q-td
              key="dividendFrequency"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ props.row.dividendFrequency }}</q-td
            >
            <q-td
              key="profitLoss"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.profitLoss) }}</q-td
            >
            <q-td
              key="profitLossPercent"
              :props="props"
              :class="getUpDownColor(props.row.profitLossPercent)"
            >
              {{
                filters.formatToPercentage(props.row.profitLossPercent)
              }}</q-td
            >
            <q-td
              key="annualized"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.annualized) }}</q-td
            >
            <q-td
              key="dailyChange"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.dailyChange) }}</q-td
            >
            <q-td
              key="dailyChangePercent"
              :props="props"
              :class="getUpDownColor(props.row.dailyChangePercent)"
            >
              {{
                filters.formatToPercentage(props.row.dailyChangePercent)
              }}</q-td
            >
            <q-td
              key="tax"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.tax) }}</q-td
            >
            <q-td
              key="lastExDay"
              :props="props"
              :class="getExPayColor(props.row.lastExDay)"
            >
              {{ filters.formatToDate(props.row.lastExDay) }}</q-td
            >
            <q-td
              key="lastPayDay"
              :props="props"
              :class="getExPayColor(props.row.lastPayDay)"
            >
              {{ filters.formatToDate(props.row.lastPayDay) }}</q-td
            >
            <q-td
              key="dividendAmount"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.dividendAmount) }}</q-td
            >
            <q-td
              key="lastTotalDividend"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToCurrency(props.row.lastTotalDividend) }}</q-td
            >
            <q-td
              key="mvPortion"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.mvPortion) }}</q-td
            >
            <q-td
              key="investedPortion"
              :props="props"
              :class="soldAllColor(props.row.shares)"
            >
              {{ filters.formatToPercentage(props.row.investedPortion) }}</q-td
            >
          </q-tr>
        </template>
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
            >
              <template v-if="col.name === 'invested'">
                {{ filters.formatToCurrency(investedTotal) }}
              </template>
              <template v-if="col.name === 'marketValue'">
                {{ filters.formatToCurrency(mvTotal) }}
              </template>
              <template v-if="col.name === 'income'">
                {{ filters.formatToCurrency(incomeTotal) }}
              </template>
              <template v-if="col.name === 'profitLoss'">
                {{ filters.formatToCurrency(plTotal) }}
              </template>
              <template v-if="col.name === 'dailyChange'">
                {{ filters.formatToCurrency(dcTotal) }}
              </template>
              <template v-if="col.name === 'yoc'">
                {{ filters.formatToPercentage(yocPortfolio) }}
              </template>
              <template v-if="col.name === 'dividendYield'">
                {{ filters.formatToPercentage(yieldPortfolio) }}
              </template>
              <template v-else> </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div v-if="viewMode === ViewModeEnum.CARD">
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
              style="height: 16px; width: 16px"
            /><b>{{ item.ticker }}</b
            >: {{ item.sector }}<br />{{ item.shares.toFixed(2) }} shares of
            {{ item.name.substring(0, 30) }}
          </div>

          <div class="row no-wrap justify-center">
            <div
              :class="getMarketValueColor(item.profitLoss)"
              @click="sortAssets(SortByEnum.PROFITLOSSPERCENT)"
            >
              {{ filters.formatToCurrency(item.marketValue) }}
              &nbsp;(<q-icon
                class="q-mr-xs q-mt-xs"
                :name="getArrow(item.profitLoss)"
              />{{ filters.formatToPercentage(item.profitLossPercent) }})
            </div>
            <div
              :class="getDailyChangeColor(item.dailyChange)"
              @click="sortAssets(SortByEnum.DAILYCHANGEPERCENT)"
            >
              Daily: (<q-icon
                class="q-mr-xs"
                :name="getDailyArrow(item.dailyChange)"
              />{{ filters.formatToPercentage(item.dailyChangePercent) }})
            </div>
          </div>

          <div
            class="text-h6 cursor-pointer"
            @click="sortAssets(SortByEnum.INCOME)"
          >
            Income: {{ filters.formatToCurrency(item.income) }}
          </div>

          <div class="row no-wrap justify-center">
            <div class="col-6 text-right">
              <b>Current price:</b>
              {{ filters.formatToCurrency(item.sharePrice) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left">
              <b>Average price:</b>
              {{ filters.formatToCurrency(item.averagePrice) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortAssets(SortByEnum.YIELD)"
            >
              <b>Yield:</b> {{ filters.formatToPercentage(item.dividendYield) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortAssets(SortByEnum.YOC)"
            >
              <b>YOC:</b> {{ filters.formatToPercentage(item.yoc) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortAssets(SortByEnum.FREQUENCY)"
            >
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
              <b>Annualized:</b>
              {{ filters.formatToPercentage(item.annualized) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortAssets(SortByEnum.MVPORTION)"
            >
              <b>Portion (mv):</b>
              {{ filters.formatToPercentage(item.mvPortion) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortAssets(SortByEnum.EX)"
            >
              <b>Ex:</b> {{ filters.formatToDate(item.lastExDay) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortAssets(SortByEnum.PAY)"
            >
              <b>Pay:</b> {{ filters.formatToDate(item.lastPayDay) }}
            </div>
          </div>

          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortAssets(SortByEnum.DIVIDENDAMOUNT)"
            >
              <b>Amount:</b> {{ filters.formatToCurrency(item.dividendAmount) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div
              class="col-6 text-left cursor-pointer"
              @click="sortAssets(SortByEnum.DIVIDENDTOTAL)"
            >
              <b>Total:</b>
              {{ filters.formatToCurrency(item.lastTotalDividend) }}
            </div>
          </div>
          <div class="row no-wrap justify-center">
            <div
              class="col-6 text-right cursor-pointer"
              @click="sortAssets(SortByEnum.INVESTEDPORTION)"
            >
              <b>Portion (invested):</b>
              {{ filters.formatToPercentage(item.investedPortion) }}
            </div>
            <q-separator vertical class="q-mx-md" />
            <div class="col-6 text-left cursor-pointer">
              <b> </b>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-page-sticky position="top">
      <div class="row q-pa-sm bg-white shadow-8">
        {{
          portfolioTable
            ? portfolioTable.filteredSortedRows.length
            : portfolioAssets.length
        }}
        assets&nbsp;
        <q-separator vertical /><q-icon
          size="xs"
          name="more_vert"
          class="q-mt-xs cursor-pointer"
        >
          <q-menu fit auto-close anchor="bottom left" self="top left">
            <q-list bordered dense separator>
              <q-item clickable v-ripple @click="switchView()">
                <q-item-section avatar>
                  <q-icon size="sm" color="primary" name="preview" />
                </q-item-section>
                <q-item-section>Switch view</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="saveView()">
                <q-item-section avatar>
                  <q-icon size="sm" color="primary" name="save_as" />
                </q-item-section>
                <q-item-section>Save view</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="toggleClosePositions()">
                <q-item-section avatar>
                  <q-icon
                    size="sm"
                    color="primary"
                    name="cancel_presentation"
                  />
                </q-item-section>
                <q-item-section>Toggle closed positions</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
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
import { filters, showAPIError, showNotification, bus } from '../utils/utils';
import { stockdivStore } from 'stores/stockdivStore';
import { SortByEnum } from '../utils/enums/SortByEnum';
import { SortDirectionEnum } from 'src/utils/enums/SortDirectionEnum';
import { useRouter } from 'vue-router';
import { ViewModeEnum } from 'src/utils/enums/ViewModeEnum';
import { date, QTable, QTableProps } from 'quasar';
import { IViewModeSettings } from 'src/utils/interfaces/IViewSettings';

export default defineComponent({
  name: 'PortfolioPage',
  setup() {
    const router = useRouter();
    const store = stockdivStore();
    const portfolioColumns: QTableProps['columns'] = [
      {
        name: 'ticker',
        required: true,
        label: 'Ticker',
        align: 'left',
        field: (row: IPortfolioAsset) => row.ticker,
        format: (val: string) => `<q-img />${val}`,
        sortable: true,
      },
      {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: IPortfolioAsset) => row.name,
        format: (val: string) => `${val}`,
        sortable: false,
      },
      {
        name: 'sector',
        label: 'Sector',
        align: 'left',
        field: (row: IPortfolioAsset) => row.sector,
        format: (val: string) => `${val}`,
        sortable: false,
      },
      {
        name: 'shares',
        label: 'Shares',
        align: 'center',
        field: (row: IPortfolioAsset) => row.shares,
        format: (val: number) => `${val}`,
        sortable: false,
      },
      {
        name: 'averagePrice',
        label: 'Average Price',
        align: 'center',
        field: (row: IPortfolioAsset) => row.averagePrice,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: false,
      },
      {
        name: 'sharePrice',
        label: 'Share Price',
        align: 'center',
        field: (row: IPortfolioAsset) => row.sharePrice,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: false,
      },
      {
        name: 'invested',
        label: 'Invested',
        align: 'center',
        field: (row: IPortfolioAsset) => row.invested,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'marketValue',
        label: 'Market Value',
        align: 'center',
        field: (row: IPortfolioAsset) => row.marketValue,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'income',
        label: 'Income',
        align: 'center',
        field: (row: IPortfolioAsset) => row.income,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'dividendYield',
        label: 'Yield',
        align: 'center',
        field: (row: IPortfolioAsset) => row.dividendYield,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'yoc',
        label: 'YOC',
        align: 'center',
        field: (row: IPortfolioAsset) => row.yoc,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dividendFrequency',
        label: 'Frequency',
        align: 'left',
        field: (row: IPortfolioAsset) => row.dividendFrequency,
        format: (val: string) => `${val}`,
        sortable: true,
      },
      {
        name: 'profitLoss',
        label: 'PL',
        align: 'center',
        field: (row: IPortfolioAsset) => row.profitLoss,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'profitLossPercent',
        label: 'PL%',
        align: 'center',
        field: (row: IPortfolioAsset) => row.profitLossPercent,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'annualized',
        label: 'Annualized',
        align: 'center',
        field: (row: IPortfolioAsset) => row.annualized,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dailyChange',
        label: 'Change',
        align: 'center',
        field: (row: IPortfolioAsset) => row.dailyChange,
        format: (val: number) => `${val}`,
        sortable: true,
      },
      {
        name: 'dailyChangePercent',
        label: 'Change%',
        align: 'center',
        field: (row: IPortfolioAsset) => row.dailyChangePercent,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'tax',
        label: 'Tax',
        align: 'center',
        field: (row: IPortfolioAsset) => row.tax,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'lastExDay',
        label: 'Ex',
        align: 'left',
        field: (row: IPortfolioAsset) => row.lastExDay,
        format: (val: string) => `${filters.formatToDate(val)}`,
        sortable: true,
      },
      {
        name: 'lastPayDay',
        label: 'Pay',
        align: 'left',
        field: (row: IPortfolioAsset) => row.lastPayDay,
        format: (val: string) => `${filters.formatToDate(val)}`,
        sortable: true,
      },
      {
        name: 'dividendAmount',
        label: 'Dividend',
        align: 'center',
        field: (row: IPortfolioAsset) => row.dividendAmount,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'lastTotalDividend',
        label: 'Total',
        align: 'center',
        field: (row: IPortfolioAsset) => row.lastTotalDividend,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'mvPortion',
        label: 'Portion% (mv)',
        align: 'center',
        field: (row: IPortfolioAsset) => row.mvPortion,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'investedPortion',
        label: 'Portion% (invested)',
        align: 'center',
        field: (row: IPortfolioAsset) => row.investedPortion,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
    ];
    return {
      filterClosePositions: ref<{ showClose: boolean }>({ showClose: false }),
      filters,
      router,
      store,
      portfolioAssets: ref<IPortfolioAsset[]>([]),
      visibleColumns: ref<string[]>([
        'ticker',
        'name',
        'sector',
        'shares',
        'averagePrice',
        'sharePrice',
        'invested',
        'marketValue',
        'income',
        'dividendYield',
        'yoc',
        'dividendFrequency',
        'profitLoss',
        'profitLossPercent',
        'annualized',
        'dailyChange',
        'dailyChangePercent',
        'tax',
        'lastExDay',
        'lastPayDay',
        'dividendAmount',
        'lastTotalDividend',
        'mvPortion',
        'investedPortion',
      ]),
      SortByEnum,
      portfolioTable: ref<QTable>(),
      showSoldAll: ref<boolean>(false),
      portfolioLoading: ref<boolean>(false),
      portfolioColumns,
      sortBy: ref<SortByEnum>(SortByEnum.NONE),
      sortDirection: ref<SortDirectionEnum>(SortDirectionEnum.DESC),
      viewMode: ref<ViewModeEnum>(ViewModeEnum.CARD),
      ViewModeEnum,
      pagination: ref({
        sortBy: store.settings.portfolioView.sortBy,
        page: 1,
        descending:
          store.settings.portfolioView.sortDirection === SortDirectionEnum.DESC,
        rowsPerPage: 0,
      }),
    };
  },
  methods: {
    filterSoldAll(): IPortfolioAsset[] {
      if (!this.filterClosePositions.showClose) {
        return this.portfolioAssets.filter((item) => {
          return item.shares !== 0;
        });
      } else return this.portfolioAssets;
    },
    toggleClosePositions() {
      this.filterClosePositions.showClose =
        !this.filterClosePositions.showClose;
    },
    saveView() {
      this.store.settings.portfolioView.sortBy =
        this.viewMode === 0
          ? this.store.settings.portfolioView.sortBy
          : this.pagination.sortBy;
      this.store.settings.portfolioView.sortDirection =
        this.viewMode === 0
          ? this.store.settings.portfolioView.sortDirection
          : this.pagination.descending
          ? SortDirectionEnum.DESC
          : SortDirectionEnum.ASC;
      this.store.settings.portfolioView.mode = this.viewMode;
      this.store.settings.portfolioView.visibleColumns = this.visibleColumns;
      let viewToSave: IViewModeSettings = {
        mode: this.viewMode,
        sortBy:
          this.viewMode === 0
            ? this.store.settings.portfolioView.sortBy
            : this.pagination.sortBy,
        sortDirection:
          this.viewMode === 0
            ? this.store.settings.portfolioView.sortDirection
            : this.pagination.descending
            ? SortDirectionEnum.DESC
            : SortDirectionEnum.ASC,
        visibleColumns: this.visibleColumns,
      };
      api
        .patch('user/settings', {
          fields: ['portfolioView'],
          values: [viewToSave],
        })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            showNotification('The view was successfully saved');
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    switchView() {
      this.viewMode =
        this.viewMode === ViewModeEnum.CARD
          ? ViewModeEnum.TABLE
          : ViewModeEnum.CARD;
    },
    gotoTickerPage(ticker: string) {
      this.router.push({
        path: `/ticker/${ticker}`,
      });
    },
    getPortfolio() {
      this.portfolioLoading = true;
      this.portfolioAssets = [];
      api
        .get(`portfolio/${this.store.selectedPortfolio}/assets`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.portfolioAssets = response.data;
            this.sortAssets(
              this.store.settings.portfolioView.sortBy,
              this.store.settings.portfolioView.sortDirection
            );
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
        ? 'text-h6 text-red q-mt-sm row no-wrap justify-center cursor-pointer'
        : 'text-h6 text-green q-mt-sm row no-wrap justify-center cursor-pointer';
    },
    getArrow(profitLoss: number): string {
      return profitLoss < 0 ? 'trending_down' : 'trending_up';
    },
    sortAssets(sortBy: SortByEnum, sortDirection?: SortDirectionEnum) {
      if (sortBy === this.sortBy) {
        this.sortDirection =
          this.sortDirection === SortDirectionEnum.ASC
            ? SortDirectionEnum.DESC
            : SortDirectionEnum.ASC;
      } else this.sortBy = sortBy;
      if (sortDirection) this.sortDirection = sortDirection;
      this.pagination = {
        sortBy: this.sortBy,
        descending: this.sortDirection === SortDirectionEnum.DESC,
        rowsPerPage: 0,
        page: 1,
      };
      switch (sortBy) {
        case SortByEnum.TICKER: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.ticker.localeCompare(pa2.ticker)
                : pa2.ticker.localeCompare(pa1.ticker)
          );
          break;
        }
        case SortByEnum.FREQUENCY: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendFrequency.localeCompare(pa2.dividendFrequency)
                : pa2.dividendFrequency.localeCompare(pa1.dividendFrequency)
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
        case SortByEnum.PROFITLOSSPERCENT: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.profitLossPercent - pa2.profitLossPercent
                : pa2.profitLossPercent - pa1.profitLossPercent
          );
          break;
        }
        case SortByEnum.DAILYCHANGEPERCENT: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dailyChangePercent - pa2.dailyChangePercent
                : pa2.dailyChangePercent - pa1.dailyChangePercent
          );
          break;
        }
        case SortByEnum.YIELD: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendYield - pa2.dividendYield
                : pa2.dividendYield - pa1.dividendYield
          );
          break;
        }
        case SortByEnum.YOC: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.yoc - pa2.yoc
                : pa2.yoc - pa1.yoc
          );
          break;
        }
        case SortByEnum.MVPORTION: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.mvPortion - pa2.mvPortion
                : pa2.mvPortion - pa1.mvPortion
          );
          break;
        }
        case SortByEnum.INVESTEDPORTION: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.investedPortion - pa2.investedPortion
                : pa2.investedPortion - pa1.investedPortion
          );
          break;
        }
        case SortByEnum.DIVIDENDTOTAL: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.lastTotalDividend - pa2.lastTotalDividend
                : pa2.lastTotalDividend - pa1.lastTotalDividend
          );
          break;
        }
        case SortByEnum.DIVIDENDAMOUNT: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.dividendAmount - pa2.dividendAmount
                : pa2.dividendAmount - pa1.dividendAmount
          );
          break;
        }
        case SortByEnum.EX: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.lastExDay.localeCompare(pa2.lastExDay)
                : pa2.lastExDay.localeCompare(pa1.lastExDay)
          );
          break;
        }
        case SortByEnum.PAY: {
          this.portfolioAssets.sort(
            (pa1: IPortfolioAsset, pa2: IPortfolioAsset) =>
              this.sortDirection === SortDirectionEnum.ASC
                ? pa1.lastPayDay.localeCompare(pa2.lastPayDay)
                : pa2.lastPayDay.localeCompare(pa1.lastPayDay)
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
        ? 'text-subtitle2 text-red q-mt-md q-mx-md cursor-pointer'
        : 'text-subtitle2 text-green q-mt-md q-mx-md cursor-pointer';
    },
    getUpDownColor(value: number): string {
      return value < 0 ? 'bg-red-5' : 'bg-green';
    },
    getExPayColor(value: string): string {
      if (new Date(value).getFullYear() < new Date().getFullYear() || new Date(value).getMonth() < new Date().getMonth()) return 'bg-green-11';
      else return date.isSameDate(new Date(), new Date(value), 'month')
        ? 'bg-purple-2'
        : 'bg-light-blue-1';
    },
    soldAllColor(shares: number): string {
      return shares === 0 ? 'text-grey-6' : 'text-black';
    },
    async portfolioChange() {
      let { data } = await api.get(
        `portfolio/${this.store.selectedPortfolio}/currency`
      );
      this.store.portfolioCurrency = data;
      this.getPortfolio();
    },
  },
  mounted() {
    if (this.store.token === '') {
      showNotification('You will need to re-login');
      this.router.push('/');
    } else {
      this.viewMode =
        this.store.settings.portfolioView.mode || ViewModeEnum.CARD;
      this.visibleColumns = this.store.settings.portfolioView.visibleColumns;
      this.getPortfolio();
      bus.on('changedPortfolio', this.portfolioChange);
      bus.on('changedSettings', this.getPortfolio);
    }
  },
  unmounted() {
    bus.off('changedPortfolio', this.getPortfolio);
    bus.off('changedSettings', this.getPortfolio);
  },
  computed: {
    investedTotal(): number {
      return this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.invested,
        0
      );
    },
    mvTotal(): number {
      return this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.marketValue,
        0
      );
    },
    incomeTotal(): number {
      return this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.income,
        0
      );
    },
    yieldPortfolio(): number {
      const lastDividendTotalYearly: number = this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.lastTotalDividendYearly,
        0
      );
      return (lastDividendTotalYearly / this.mvTotal) * 100
    },
    yocPortfolio(): number {
      const lastDividendTotalYearly: number = this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.lastTotalDividendYearly,
        0
      );
      return (lastDividendTotalYearly / this.investedTotal) * 100
    },
    plTotal(): number {
      return this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.profitLoss,
        0
      );
    },
    dcTotal(): number {
      return this.portfolioAssets.reduce(
        (current: number, prev: IPortfolioAsset) => current + prev.dailyChange,
        0
      );
    },
  },
});
</script>
<style>
.my-sticky-header-column-table {
  max-height: 1310px;
}
.my-sticky-header-column-table td:first-child {
  background-color: #cfdef5 !important;
}
.my-sticky-header-column-table tr th {
  position: sticky;
  z-index: 2;
  background: #fff;
}
.my-sticky-header-column-table thead tr:last-child th {
  top: 48px;
  z-index: 3;
}
.my-sticky-header-column-table thead tr:first-child th {
  top: 0;
  z-index: 1;
}
.my-sticky-header-column-table tr:first-child th:first-child {
  z-index: 3;
}
.my-sticky-header-column-table td:first-child {
  z-index: 1;
}
.my-sticky-header-column-table td:first-child,
.my-sticky-header-column-table th:first-child {
  position: sticky;
  left: 0;
}
.my-sticky-header-column-table tbody tr:last-child {
  bottom: 0;
  position: sticky;
  z-index: 1;
  background-color: #cfdef5;
}
</style>
