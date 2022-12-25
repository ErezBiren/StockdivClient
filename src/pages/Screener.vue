<template>
  <q-page class="column">
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
        :options="screenerColumns"
        transition-show="jump-up"
        transition-hide="jump-up"
      />
      <q-table
        dense
        bordered
        class="absolute-full scroll q-ma-md my-sticky-header-column-table shadow-8 bg-light-blue-1"
        title="Screener"
        :rows="screenerTickers"
        :columns="screenerColumns"
        row-key="ticker"
        v-model:pagination="pagination"
        v-model:visible-columns="visibleColumns"
        :hide-bottom="true"
        :rows-per-page-options="[0]"
        virtual-scroll
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
              <div>
                {{ props.row.ticker }}
              </div>
            </q-td>
            <q-td key="name" :props="props"> {{ props.row.name }}</q-td>
            <q-td key="sector" :props="props"> {{ props.row.sector }}</q-td>
            <q-td key="yearsIncrease" :props="props">
              {{ props.row.yearsIncrease }}</q-td
            >
            <q-td key="sharePrice" :props="props">
              {{ filters.formatToCurrency(props.row.sharePrice) }}</q-td
            >
            <q-td key="dividendFrequency" :props="props">
              {{ props.row.frequency }}</q-td
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
            <q-td key="dividendAmount" :props="props">
              {{ filters.formatToCurrency(props.row.dividendAmount) }}</q-td
            >
            <q-td key="pe" :props="props">
              {{ filters.formatToNumber(props.row.pe) }}</q-td
            >
            <q-td key="fpe" :props="props">
              {{ filters.formatToNumber(props.row.fpe) }}</q-td
            >
            <q-td key="beta" :props="props">
              {{ filters.formatToNumber(props.row.beta) }}</q-td
            >
            <q-td key="low52w" :props="props">
              {{ filters.formatToCurrency(props.row.low52w) }}</q-td
            >
            <q-td key="high52w" :props="props">
              {{ filters.formatToCurrency(props.row.high52w) }}</q-td
            >
            <q-td
              key="payoutRatio"
              :props="props"
              :style="setRangeColor(props.row.payoutRatio)"
            >
              {{ filters.formatToPercentage(props.row.payoutRatio) }}</q-td
            >
            <q-td key="dividendYield" :props="props">
              {{ filters.formatToPercentage(props.row.dividendYield) }}</q-td
            >
            <q-td key="marketCapital" :props="props">
              {{
                filters.formatToCurrency(
                  props.row.marketCapital / 1000 / 1000 / 1000
                )
              }}B</q-td
            >
            <q-td key="dgr1" :props="props">
              {{ filters.formatToPercentage(props.row.dgr1) }}</q-td
            >
            <q-td key="dgr3" :props="props">
              {{ filters.formatToPercentage(props.row.dgr3) }}</q-td
            >
            <q-td key="dgr5" :props="props">
              {{ filters.formatToPercentage(props.row.dgr5) }}</q-td
            >
            <q-td key="dgr10" :props="props">
              {{ filters.formatToPercentage(props.row.dgr10) }}</q-td
            >
            <q-td key="debtEquity" :props="props">
              {{ filters.formatToNumber(props.row.debtEquity) }}</q-td
            >
            <q-td key="cccList" :props="props">
              <q-checkbox
                dense
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                v-model="props.row.cccList"
                disable
              />
            </q-td>
            <q-td key="inPortfolio" :props="props">
              <q-checkbox
                dense
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
                v-model="props.row.inPortfolio"
                disable
              />
            </q-td>
            <q-td key="dailyChange" :props="props">
              {{ filters.formatToCurrency(props.row.dailyChange) }}</q-td
            >
            <q-td key="dailyChangePercent" :props="props">
              {{
                filters.formatToPercentage(props.row.dailyChangePercent)
              }}</q-td
            >
          </q-tr>
        </template>
      </q-table>
    </div>
    <div v-if="viewMode === ViewModeEnum.CARD">
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
                    item.marketCapital / 1000 / 1000 / 1000
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
              <div
                class="col-6 text-right"
                @click="sortScreener(SortByEnum.PE)"
              >
                <b>PE:</b> {{ filters.formatToNumber(item.pe) }}
              </div>
              <q-separator vertical class="q-mx-md" />
              <div
                class="col-6 text-left"
                @click="sortScreener(SortByEnum.FPE)"
              >
                <b>FPE:</b> {{ filters.formatToNumber(item.fpe) }}
              </div>
            </div>

            <div class="row no-wrap justify-center">
              <div
                class="col-6 text-right"
                @click="sortScreener(SortByEnum.LOW52W)"
              >
                <b>52w low:</b> {{ filters.formatToCurrency(item.low52w) }}
              </div>
              <q-separator vertical class="q-mx-md" />
              <div
                class="col-6 text-left"
                @click="sortScreener(SortByEnum.HIGH52W)"
              >
                <b>52w high:</b> {{ filters.formatToCurrency(item.high52w) }}
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
                {{ filters.formatToNumber(item.debtEquity) }}
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
              <div
                class="col-6 text-left"
                @click="sortScreener(SortByEnum.DGR3)"
              >
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
            <div class="row no-wrap justify-center">
              <div
                class="col-6 text-right cursor-pointer"
                @click="sortScreener(SortByEnum.DAILYCHANGE)"
              >
                <b>Daily:</b> {{ filters.formatToCurrency(item.dailyChange) }}
              </div>
              <q-separator vertical class="q-mx-md" />
              <div
                class="col-6 text-left cursor-pointer"
                @click="sortScreener(SortByEnum.DAILYCHANGEPERCENT)"
              >
                <b>% Daily:</b>
                {{ filters.formatToPercentage(item.dailyChangePercent) }}
              </div>
            </div>
            <div class="row no-wrap justify-center">
              <div
                class="col-6 text-right cursor-pointer"
                @click="sortScreener(SortByEnum.BETA)"
              >
                <b>Beta:</b> {{ filters.formatToNumber(item.beta) }}
              </div>
              <q-separator vertical class="q-mx-md" />
              <div class="col-6 text-left cursor-pointer">
                <b> </b>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-virtual-scroll>
    </div>

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
import {
  bus,
  filters,
  getRangeColor,
  showAPIError,
  showNotification,
} from '../utils/utils';
import { useRouter } from 'vue-router';
import { stockdivStore } from '../stores/stockdivStore';
import { ViewModeEnum } from 'src/utils/enums/ViewModeEnum';
import { IViewModeSettings } from 'src/utils/interfaces/IViewSettings';
import { date, QTableProps } from 'quasar';

export default defineComponent({
  name: 'screenerPage',
  setup() {
    const screenerColumns: QTableProps['columns'] = [
      {
        name: 'ticker',
        required: true,
        label: 'Ticker',
        align: 'left',
        field: (row: IScreenerTicker) => row.ticker,
        format: (val: string) => `<q-img />${val}`,
        sortable: true,
      },
      {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: IScreenerTicker) => row.name,
        format: (val: string) => `${val}`,
        sortable: false,
      },
      {
        name: 'sector',
        label: 'Sector',
        align: 'left',
        field: (row: IScreenerTicker) => row.sector,
        format: (val: string) => `${val}`,
        sortable: false,
      },
      {
        name: 'yearsIncrease',
        label: 'Years',
        align: 'center',
        field: (row: IScreenerTicker) => row.yearsIncrease,
        format: (val: number) => `${val}`,
        sortable: true,
      },
      {
        name: 'sharePrice',
        label: 'Share Price',
        align: 'center',
        field: (row: IScreenerTicker) => row.sharePrice,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: false,
      },
      {
        name: 'dividendFrequency',
        label: 'Frequency',
        align: 'left',
        field: (row: IScreenerTicker) => row.frequency,
        format: (val: string) => `${val}`,
        sortable: true,
      },
      {
        name: 'lastExDay',
        label: 'Ex',
        align: 'left',
        field: (row: IScreenerTicker) => row.lastExDay,
        format: (val: string) => `${filters.formatToDate(val)}`,
        sortable: true,
      },
      {
        name: 'lastPayDay',
        label: 'Pay',
        align: 'left',
        field: (row: IScreenerTicker) => row.lastPayDay,
        format: (val: string) => `${filters.formatToDate(val)}`,
        sortable: true,
      },
      {
        name: 'dividendAmount',
        label: 'Dividend',
        align: 'center',
        field: (row: IScreenerTicker) => row.dividendAmount,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'pe',
        label: 'PE',
        align: 'center',
        field: (row: IScreenerTicker) => row.pe,
        format: (val: number) => `${val}`,
        sortable: true,
      },
      {
        name: 'fpe',
        label: 'FPE',
        align: 'center',
        field: (row: IScreenerTicker) => row.fpe,
        format: (val: number) => `${val}`,
        sortable: true,
      },
      {
        name: 'beta',
        label: 'Beta',
        align: 'center',
        field: (row: IScreenerTicker) => row.beta,
        format: (val: number) => `${filters.formatToNumber(val)}`,
        sortable: true,
      },
      {
        name: 'low52w',
        label: 'Low 52w',
        align: 'center',
        field: (row: IScreenerTicker) => row.low52w,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'high52w',
        label: 'High 52w',
        align: 'center',
        field: (row: IScreenerTicker) => row.high52w,
        format: (val: number) => `${filters.formatToCurrency(val)}`,
        sortable: true,
      },
      {
        name: 'payoutRatio',
        label: 'Payout Ratio',
        align: 'center',
        field: (row: IScreenerTicker) => row.payoutRatio,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dividendYield',
        label: 'Yield',
        align: 'center',
        field: (row: IScreenerTicker) => row.dividendYield,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'marketCapital',
        label: 'Market Capital',
        align: 'center',
        field: (row: IScreenerTicker) => row.marketCapital,
        format: (val: number) =>
          `${filters.formatToCurrency(val / 1000 / 1000 / 1000)}B`,
        sortable: true,
      },
      {
        name: 'dgr1',
        label: 'DGR1',
        align: 'center',
        field: (row: IScreenerTicker) => row.dgr1,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dgr3',
        label: 'DGR3',
        align: 'center',
        field: (row: IScreenerTicker) => row.dgr3,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dgr5',
        label: 'DGR5',
        align: 'center',
        field: (row: IScreenerTicker) => row.dgr5,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'dgr10',
        label: 'DGR10',
        align: 'center',
        field: (row: IScreenerTicker) => row.dgr10,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
      {
        name: 'debtEquity',
        label: 'Debt Equity',
        align: 'center',
        field: (row: IScreenerTicker) => row.debtEquity,
        format: (val: number) => `${filters.formatToNumber(val)}`,
        sortable: true,
      },
      {
        name: 'cccList',
        label: 'CCC List',
        align: 'center',
        field: (row: IScreenerTicker) => row.cccList,
        format: (val: boolean) => `${val}`,
        sortable: true,
      },
      {
        name: 'inPortfolio',
        label: 'In Portfolio',
        align: 'center',
        field: (row: IScreenerTicker) => row.inPortfolio,
        format: (val: boolean) => `${val}`,
        sortable: true,
      },
      {
        name: 'dailyChange',
        label: 'Change',
        align: 'center',
        field: (row: IScreenerTicker) => row.dailyChange,
        format: (val: number) => `${val}`,
        sortable: true,
      },
      {
        name: 'dailyChangePercent',
        label: 'Change%',
        align: 'center',
        field: (row: IScreenerTicker) => row.dailyChangePercent,
        format: (val: number) => `${filters.formatToPercentage(val)}`,
        sortable: true,
      },
    ];
    const store = stockdivStore();
    const router = useRouter();
    return {
      viewMode: ref<ViewModeEnum>(ViewModeEnum.CARD),
      ViewModeEnum,
      filters,
      router,
      store,
      screenerColumns,
      SortByEnum,
      screenerLoading: ref<boolean>(false),
      screenerTickers: ref<IScreenerTicker[]>([]),
      sortBy: ref<SortByEnum>(SortByEnum.NONE),
      sortDirection: ref<SortDirectionEnum>(SortDirectionEnum.DESC),
      pagination: ref({
        sortBy: store.settings.screenerView.sortBy,
        page: 1,
        descending:
          store.settings.screenerView.sortDirection === SortDirectionEnum.DESC,
        rowsPerPage: 0,
      }),
      visibleColumns: ref<string[]>([
        'ticker',
        'name',
        'sector',
        'yearsIncrease',
        'sharePrice',
        'dividendFrequency',
        'lastExDay',
        'lastPayDay',
        'dividendAmount',
        'pe',
        'fpe',
        'beta',
        'low52w',
        'high52w',
        'payoutRatio',
        'dividendYield',
        'marketCapital',
        'dgr1',
        'dgr3',
        'dgr5',
        'dgr10',
        'debtEquity',
        'cccList',
        'inPortfolio',
        'dailyChange',
        'dailyChangePercent',
      ]),
    };
  },
  methods: {
    getExPayColor(value: string): string {
      return date.isSameDate(new Date(), new Date(value), 'month')
        ? 'bg-purple-2'
        : 'bg-light-blue-1';
    },
    saveView() {
      this.store.settings.screenerView.sortBy =
        this.viewMode === 0
          ? this.store.settings.screenerView.sortBy
          : this.pagination.sortBy;
      this.store.settings.screenerView.sortDirection =
        this.viewMode === 0
          ? this.store.settings.screenerView.sortDirection
          : this.pagination.descending
          ? SortDirectionEnum.DESC
          : SortDirectionEnum.ASC;
      this.store.settings.screenerView.mode = this.viewMode;
      this.store.settings.screenerView.visibleColumns = this.visibleColumns;
      let viewToSave: IViewModeSettings = {
        mode: this.viewMode,
        sortBy:
          this.viewMode === 0
            ? this.store.settings.screenerView.sortBy
            : this.pagination.sortBy,
        sortDirection:
          this.viewMode === 0
            ? this.store.settings.screenerView.sortDirection
            : this.pagination.descending
            ? SortDirectionEnum.DESC
            : SortDirectionEnum.ASC,
        visibleColumns: this.visibleColumns,
      };
      api
        .patch('user/settings', {
          field: 'screenerView',
          value: viewToSave,
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
    setRangeColor(value: number): string {
      return `background-color:${getRangeColor(value / 100)}`;
    },
    sortScreener(sortBy: SortByEnum, sortDirection?: SortDirectionEnum) {
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
        case SortByEnum.FPE: {
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
                ? pa1.frequency.localeCompare(pa2.frequency)
                : pa2.frequency.localeCompare(pa1.frequency)
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
          'You have many tickers, loading may take a longer than expected...'
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
    if (this.store.token === '') {
      showNotification('You will need to re-login');
      this.router.push('/');
    } else {
      bus.on('reloadScreener', this.getScreener);
      bus.on('changedSettings', this.getScreener);
      this.viewMode =
        this.store.settings.screenerView.mode || ViewModeEnum.CARD;
      this.visibleColumns = this.store.settings.screenerView.visibleColumns;
      this.getScreener();
    }
  },
  beforeUnmount() {
    bus.off('reloadScreener', this.getScreener);
    bus.off('changedSettings', this.getScreener);
  },
});
</script>
<style>
.my-sticky-header-column-table {
  /* height or max-height is important */
  max-height: 1310px;
}
.my-sticky-header-column-table td:first-child {
  /* bg color is important for td; just specify one */
  background-color: #cfdef5 !important;
}
.my-sticky-header-column-table tr th {
  position: sticky;
  /* higher than z-index for td below */
  z-index: 2;
  /* bg color is important; just specify one */
  background: #fff;
}
.my-sticky-header-column-table thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px;
  /* highest z-index */
  z-index: 3;
}
.my-sticky-header-column-table thead tr:first-child th {
  top: 0;
  z-index: 1;
}
.my-sticky-header-column-table tr:first-child th:first-child {
  /* highest z-index */
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
</style>
