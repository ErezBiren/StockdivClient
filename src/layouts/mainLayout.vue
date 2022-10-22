<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-if="store.token !== ''">
      <q-toolbar class="bg-green-2">
        <q-toolbar-title
          ><div class="text-indigo row">
            Hello {{ userName }}
            <q-icon
              color="blue"
              name="settings"
              class="cursor-pointer q-my-xs q-mx-sm"
              @click="openSettings()"
            >
              <q-tooltip>Settings</q-tooltip>
            </q-icon>
            <q-icon
              color="blue"
              name="logout"
              class="cursor-pointer q-my-xs q-mx-sm"
              @click="logout()"
            >
              <q-tooltip>Logout</q-tooltip>
            </q-icon>
            <q-space />
            StockDiv 3.0.1
          </div>
          <div class="row no-wrap">
            <q-select
              v-model="selectedPortfolio"
              :options="store.portfolios"
              dense
              :disable="store.portfolios.length < 3"
              hint="Portfolio"
            ></q-select>
            <q-space />
            <q-input
              hint="Search ticker/name"
              ref="searchTickerInput"
              dense
              class="q-mr-sm"
              type="search"
              mask="AAAAAAAAAA"
              v-model="dataToSearch"
              @keyup="triggerSearch"
              ><q-tooltip
                >Enter at least 3 characters of a ticker/company to see
                available tickers</q-tooltip
              >
              <q-menu
                fit
                v-if="showSearchResultsMenu"
                v-model="showSearchResultsMenu"
                anchor="bottom left"
                self="top left"
                @show="setFocusOnSearch()"
              >
                <q-list
                  bordered
                  separator
                  style="height: 400px"
                  class="list scroll"
                >
                  <q-item
                    clickable
                    v-ripple
                    v-bind:key="item.ticker"
                    v-for="item in searchListOptions"
                    @click="gotoTickerPage(item.ticker)"
                  >
                    <q-item-section>
                      <q-item-label>{{ item.ticker }}</q-item-label>
                      <q-item-label caption>{{ item.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-input>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-dialog
    :model-value="!userWithTransactions && store.token !== '' && showNoTransactionsDialog"
    role="dialog"
    persistent
    aria-modal="true"
    position="bottom"
    ><q-card class="bg-info">
      <q-card-section>
        In order to experience the so many features of StockDiv, please either
        import your current portfolio from a csv file or add a new transaction
        manually.</q-card-section
      >
      <q-separator />
      <q-card-section>
        <div class="row">
          File format:<q-checkbox
            dense
            v-model="isSharePrice"
            label="Share price instead of total price"
            checked-icon="task_alt"
            class="q-mx-sm"
            unchecked-icon="highlight_off"
          />
        </div>
        ticker, quantity, total price, date (yyyy-mm-dd), portfolio,
        commissions, currency<br />
        * Header row is not needed<br />* Commissions and currency are
        optional<br />* Preferred tickers format is, i.e. HMLP-PA<br />*
        Negative quantity represents a sell transaction
        <div class="row">
          <q-file
            style="max-width: 300px"
            v-model="csvToImport"
            label="Select a csv file"
            accept=".csv"
          /><q-space />
          <q-btn
            flat
            :disable="csvToImport == null"
            class="primary"
            @click="openImportFile()"
            label="Import"
            ><q-tooltip>Select a file to import</q-tooltip></q-btn
          >
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat @click="addManualTransaction()">Add transaction manually (See above search field)</q-btn>
      </q-card-actions>
      <q-inner-loading :showing="importInProcess">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showSettings"
    role="dialog"
    aria-modal="true"
    position="bottom"
  >
    <q-card class="bg-info">
      <q-card-section class="row text-h5">Settings </q-card-section>
      <q-separator />
      <q-card-section class="row">
        <q-input
          type="text"
          dense
          v-model="userNameEdit"
          hint="Your name"
        /><q-icon
          name="edit"
          size="sm"
          @click="setUserName()"
          class="cursor-pointer q-mt-sm"
          ><q-tooltip>Update your name</q-tooltip></q-icon
        >
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          v-model="dateFormat"
          dense
          :options="dateFormatOptions"
          hint="Date format"
        />
      </q-card-section> </q-card
  ></q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { api } from 'src/boot/axios';
import { bus, isNumber, showAPIError, showNotification } from 'src/utils/utils';
import { date, QInput } from 'quasar';
import { CurrencyCodeEnum } from 'src/utils/enums/CurrencyCodeEnum';
import { ITransactionData } from 'src/utils/interfaces/ITransactionData';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const store = stockdivStore();
    const router = useRouter();
    let importFileContent = '';
    const dateFormatOptions: string[] = [
      'YYYY-MM-DD',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
    ];
    let searchTimer = -1;
    return {
      store,
      router,
      userName: ref<string>(''),
      showSettings: ref<boolean>(false),
      userNameEdit: ref<string>(''),
      userWithTransactions: ref<boolean>(true),
      csvToImport: ref(),
      importFileContent,
      importInProcess: ref<boolean>(false),
      isSharePrice: ref<boolean>(false),
      dateFormat: ref<string>('YYYY-MM-DD'),
      searchTickerInput: ref<QInput>(),
      dataToSearch: ref<string>(''),
      searchListOptions: ref<{ ticker: string; name: string }[]>([]),
      showSearchResultsMenu: ref<boolean>(false),
      selectedPortfolio: ref<string>(),
      showNoTransactionsDialog: ref<boolean>(false),
      dateFormatOptions,
      searchTimer,
    };
  },
  methods: {
    addManualTransaction() {
      this.showNoTransactionsDialog = false;
      setTimeout(() => {
        this.setFocusOnSearch();
      }, 150); 
    },
    logout() {
      this.store.portfolios = [];
      this.store.token = '';
      this.router.push({ path: '/login' });
    },
    gotoTickerPage(ticker: string) {
      this.router.push({ path: `/ticker/${this.selectedPortfolio}/${ticker}` });
    },
    setFocusOnSearch() {
      if (this.searchTickerInput) this.searchTickerInput.focus();
    },
    getSearchOptions() {
      this.showSearchResultsMenu = false;
      api
        .get(`/ticker/search?searchText=${this.dataToSearch}`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.searchListOptions = response.data;
            this.showSearchResultsMenu = true;
          }
        })
        .catch((err) => {
          this.importInProcess = false;
          showAPIError(err);
        });
    },
    searchTimeOut() {
      if (this.searchTimer === -1) {
        clearTimeout(this.searchTimer);
        this.searchTimer = -1;
      }
      this.searchTimer = window.setTimeout(() => {
        this.getSearchOptions();
      }, 200);
    },
    triggerSearch() {
      this.searchListOptions = [];
      if (this.dataToSearch.length < 3) return;
      this.searchTimeOut();
    },
    checkImportContent(content: string[]): string[] {
      const tickersList: string[] = [];
      for (let line in content) {
        if (content[line].trim() === '') continue;
        if (content[line].split(',').length < 5) {
          this.importInProcess = false;
          showNotification(`Entry ${content[line]} is missing data`);
          return [];
        }
        if (
          tickersList.includes(content[line].split(',')[0].trim().toUpperCase())
        ) {
          continue;
        }
        tickersList.push(content[line].split(',')[0].trim().toUpperCase());
      }
      return tickersList;
    },
    importTheFile() {
      this.importInProcess = true;
      const content: string[] = this.importFileContent.split('\n');
      const tickersList: string[] = this.checkImportContent(content);
      if (tickersList.length === 0) {
        this.importInProcess = false;
        showNotification('No tickers to import');
        return;
      }
      api
        .post('ticker/exist', tickersList)
        .then((response) => {
          if (response.data.error) {
            this.importInProcess = false;
            showNotification(response.data.error);
          } else if (response.data.length > 0) {
            this.importInProcess = false;
            showNotification(
              'The following tickers were not found: ' + response.data
            );
          } else {
            let err = '';
            let theLine: string[];
            const currencyArray: string[] = Object.values(CurrencyCodeEnum);
            for (let line in content) {
              if (content[line].trim() === '') continue;
              theLine = content[line].split(',');
              if (!isNumber(theLine[1])) {
                err = `${theLine[0]}: make sure quantity is a valid number`;
                break;
              } else if (!isNumber(theLine[2])) {
                err = `${theLine[0]}: make sure total cost is a valid number`;
                break;
              } else if (
                !/\d{4}-\d{2}-\d{2}/.test(theLine[3]) ||
                !date.isValid(theLine[3])
              ) {
                err = `${theLine[0]}: make sure that the date format is yyyy-mm-dd`;
                break;
              } else if (theLine[4].trim() === '') {
                err = `${theLine[0]}: portfolio is missing`;
                break;
              } else if (
                theLine.length > 6 &&
                !currencyArray.includes(theLine[6].trim())
              ) {
                err = `${theLine[0]}: The currency '${theLine[6]}' is not supported`;
                break;
              }
            }
            if (err !== '') {
              this.importInProcess = false;
              showNotification(err);
            } else {
              let theLine: string[];
              let importTicker: string;
              let importShares: number;
              let importPrice: number;
              let importSharePrice: number;
              let importDate: string;
              let importPortfolio: string;
              let importCurrency: string;
              let transactions: ITransactionData[] = [];
              for (let line in content) {
                if (content[line].trim() === '') continue;
                theLine = content[line].split(',');
                importTicker = theLine[0].trim().toUpperCase();
                importShares = parseFloat(theLine[1]);
                importPrice = Math.abs(parseFloat(theLine[2]));
                if (this.isSharePrice)
                  importSharePrice = Math.abs(parseFloat(theLine[2]));
                else
                  importSharePrice =
                    Math.round((importPrice / importShares) * 10000) / 10000;
                importDate = `${theLine[3]}T00:00:00.000Z`;
                importPortfolio = theLine[4].trim();
                importCurrency = 'USD';
                if (theLine.length > 6) importCurrency = theLine[6].trim();
                transactions.push({
                  ticker: importTicker,
                  portfolio: importPortfolio,
                  sharePrice: importSharePrice,
                  shares: importShares,
                  when: importDate,
                  currency: importCurrency,
                });
              }
              this.importTransactions(transactions);
            }
          }
        })
        .catch((err) => {
          this.importInProcess = false;
          showAPIError(err);
        });
    },
    importTransactions(transactions: ITransactionData[]) {
      api
        .post('transaction', transactions)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.importInProcess = false;
            showNotification('Transactions were successfully imported');
            bus.emit('transactionChange', {});
            this.getPortfoliosList();
          }
        })
        .catch((err) => {
          this.importInProcess = false;
          showAPIError(err);
        });
    },
    openImportFile() {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e || !e.target || !e.target.result) return;
        this.importFileContent = e.target.result as string;
        this.importTheFile();
      };
      if (this.csvToImport != null) reader.readAsText(this.csvToImport);
    },
    openSettings() {
      this.userNameEdit = this.userName;
      this.showSettings = true;
    },
    setUserName() {
      if (this.userName === this.userNameEdit) return;
      api
        .put('user/name', { name: this.userNameEdit })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            showNotification('Your name was updated');
            this.getUserName();
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getUserName() {
      api
        .get('user/name')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.userName = response.data.name;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    runOnLoginSuccess() {
      this.getUserName();
      this.getPortfoliosList();
    },
    getPortfoliosList() {
      api
        .get('portfolio/all')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.store.portfolios = response.data;
            if (response.data.length === 2) {
              this.selectedPortfolio = response.data[1];
            } else this.selectedPortfolio = response.data[0];
            bus.emit('hasTransactions', this.store.portfolios.length > 0);
            this.userWithTransactions = this.store.portfolios.length > 0;
            this.showNoTransactionsDialog = !this.userWithTransactions;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
  },
  mounted() {
    bus.on('loginSuccess', this.runOnLoginSuccess);
    bus.on('transactionChange', this.getPortfoliosList);
  },
  beforeUnmount() {
    bus.off('loginSuccess', this.runOnLoginSuccess);
    bus.off('transactionChange', this.getPortfoliosList);
  },
});
</script>
