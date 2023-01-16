<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-if="store.token !== ''">
      <q-toolbar class="bg-green-2">
        <q-toolbar-title
          ><div class="text-indigo row no-wrap q-mt-sm">
            <q-btn
              color="secondary"
              label="Donate"
              push
              dense
              class="q-mr-sm"
              size="small"
              @click="gotoDonate()"
              ><q-tooltip class="bg-indigo">Donating is caring :)</q-tooltip>
            </q-btn>
            Hello {{ userName }}
            <q-icon
              color="blue"
              name="settings"
              v-if="store.portfolios.length > 0"
              class="cursor-pointer q-my-xs q-mx-sm"
              @click="openSettings()"
            >
              <q-tooltip class="bg-indigo">Settings</q-tooltip>
            </q-icon>

            <q-icon
              color="blue"
              name="home"
              v-if="store.portfolios.length > 0"
              class="cursor-pointer q-my-xs q-mx-sm"
              @click="gotoOverview()"
            >
              <q-tooltip class="bg-indigo">Overview</q-tooltip>
            </q-icon>

            <q-space />
            <q-btn
              color="blue"
              flat
              dense
              icon="announcement"
              size="sm"
              style="margin-top: -5px"
              class="cursor-pointer q-my-xs q-mx-sm"
              v-if="
                store.announcements.length > 0 && store.portfolios.length > 0
              "
              @click="showAnnouncements()"
            >
              <q-badge
                color="red"
                floating
                transparent
                style="margin-top: 11px"
                class="q-mr-md"
                :label="store.announcements.length"
              />
              <q-tooltip class="bg-indigo">Announcements</q-tooltip>
            </q-btn>

            <q-icon
              color="blue"
              name="logout"
              class="cursor-pointer q-mx-sm"
              @click="logout()"
            >
              <q-tooltip class="bg-indigo">Logout</q-tooltip>
            </q-icon>
          </div>
          <div class="row no-wrap">
            <q-select
              v-model="store.selectedPortfolio"
              :options="store.portfolios"
              dense
              :disable="store.portfolios.length < 3"
              hint="Portfolio"
              @update:model-value="changePortfolio()"
            ></q-select>
            <q-space />
            <q-input
              hint="Search ticker/name"
              ref="searchTickerInput"
              dense
              input-class="text-uppercase"
              class="q-mr-sm"
              type="search"
              v-model="dataToSearch"
              @keyup="triggerSearch"
              @keydown="searchKeyDown($event)"
              ><q-tooltip
                >Enter 3 chars minimum to see available tickers</q-tooltip
              >
              <q-menu
                fit
                v-if="showSearchResultsMenu"
                v-model="showSearchResultsMenu"
                anchor="bottom left"
                no-focus
                auto-close
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
                      <q-item-label caption>{{
                        item.name.substring(0, 30)
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-input>
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-inner-loading :showing="loginLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-header>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>

  <q-dialog
    :model-value="store.token !== '' && showNoTransactionsDialog"
    role="dialog"
    persistent
    aria-modal="true"
    position="bottom"
    ><q-card class="bg-info">
      <q-card-section>
        Import your portfolio from a csv file or search for a ticker to add a
        transaction manually</q-card-section
      >
      <q-separator />
      <q-card-section>
        <div class="row">
          File format:<q-checkbox
            dense
            v-model="isSharePrice"
            label="Share price instead of total price"
            checked-icon="task_alt"
            class="q-mx-sm text-weight-bold"
            unchecked-icon="highlight_off"
          />
        </div>
        ticker, quantity, total price, date (yyyy-mm-dd), portfolio,
        commissions, currency<br />* Commissions and currency are optional<br />*
        Negative quantity represents a sell transaction
        <div class="row">
          <q-file
            style="width: 200px; max-width: 200px"
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
            ><q-tooltip class="bg-indigo"
              >Select a file to import</q-tooltip
            ></q-btn
          >
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn @click="addManualTransaction()" label="Add transaction manually">
          <q-tooltip class="bg-indigo">
            See above search field to find your ticker
          </q-tooltip></q-btn
        >
      </q-card-actions>
      <q-inner-loading :showing="importInProcess">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showContactWindow"
    role="dialog"
    aria-modal="true"
    position="bottom"
  >
    <q-card class="bg-info">
      <q-card-section class="text-h5"
        ><div class="row no-wrap">
          <q-img :src="'logo.png'" class="logo" />
          <div class="q-mt-sm">Contact</div>
        </div>
        <q-separator />
        <q-input
          v-model="feedback"
          type="textarea"
          counter
          maxlength="1000"
          autogrow
          autofocus
          dense
          hint="What's on your mind?"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-icon
          name="send"
          class="cursor-pointer q-ma-sm"
          @click="sendFeedback()"
          ><q-tooltip class="bg-indigo">Send</q-tooltip></q-icon
        >
      </q-card-actions>
      <q-inner-loading :showing="sendingFeedback">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showSettingsPopup"
    role="dialog"
    aria-modal="true"
    position="bottom"
  >
    <q-card class="bg-info">
      <q-card-section class="row text-h5"
        ><q-img :src="'logo.png'" class="logo" />
        <div class="q-mt-sm">Settings</div>
        <q-space />
        <div class="text-subtitle2">3.2.6</div></q-card-section
      >
      <div class="text-center q-mx-sm" style="font-size: 12px">
        Click
        <a href="https://poll.ly/pAQ1KeZI5F2FFnNqpFFF" target="_blank">here</a>
        to suggest or upvote a feature request
      </div>
      <q-separator />
      <q-card-section class="row no-wrap">
        <q-input
          type="text"
          dense
          class="q-mx-sm"
          v-model="userNameEdit"
          hint="Your name"
          :rules="[(val) => (val && val !== '') || 'Name is missing']"
        /><q-select
          v-model="dateFormat"
          dense
          class="q-mx-sm"
          :options="dateFormatOptions"
          hint="Date format"
        />
      </q-card-section>

      <q-card-section class="row no-wrap">
        <q-input
          v-model.number="defaultTax"
          type="number"
          dense
          class="q-mx-sm"
          step="0.01"
          prefix="%"
          style="width: 70px"
          hint="Default Tax"
          :rules="[
            (val) =>
              (val && val >= 0 && val <= 100) || 'Default tax is invalid',
          ]"
        />
        <q-input
          v-model.number="decimalDigits"
          type="number"
          dense
          style="width: 80px"
          class="q-mx-sm"
          hint="Decimal Digits"
          :rules="[(val) => (val && val >= 0) || 'Decimal Digits is missing']"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-icon
          name="password"
          class="cursor-pointer q-ma-sm"
          @click="changePassword()"
          ><q-tooltip class="bg-indigo">Change password</q-tooltip></q-icon
        >
        <q-icon
          name="file_download"
          class="cursor-pointer q-ma-sm"
          @click="exportTransactions()"
          ><q-tooltip class="bg-indigo">Export transactions</q-tooltip></q-icon
        >
        <q-icon
          name="file_upload"
          class="cursor-pointer q-ma-sm"
          @click="importTransactionsWindow()"
          ><q-tooltip class="bg-indigo">Import transactions</q-tooltip></q-icon
        >
        <q-icon
          name="rate_review"
          class="cursor-pointer q-ma-sm"
          @click="showContactUsWindow()"
          ><q-tooltip class="bg-indigo">Contact</q-tooltip></q-icon
        >
        <q-separator vertical />
        <q-icon
          name="done"
          color="primary"
          flat
          @click="saveSettings()"
          size="sm"
          class="cursor-pointer"
        >
          <q-tooltip class="bg-indigo">Save</q-tooltip>
        </q-icon>
      </q-card-actions>
      <q-separator />
      <q-card-section
        style="font-size: 10px"
        class="q-ma-none q-pa-none text-center text-subtitle2"
        >Logo: @luca_pettini<q-separator />
      </q-card-section>
      <q-inner-loading :showing="savingSettings">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
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
import axios, { AxiosError } from 'axios';

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
      feedback: ref<string>(''),
      showContactWindow: ref<boolean>(false),
      store,
      router,
      userName: ref<string>(''),
      loginLoading: ref<boolean>(false),
      showSettingsPopup: ref<boolean>(false),
      userNameEdit: ref<string>(''),
      csvToImport: ref(),
      importFileContent,
      importInProcess: ref<boolean>(false),
      isSharePrice: ref<boolean>(false),
      dateFormat: ref<string>('YYYY-MM-DD'),
      searchTickerInput: ref<QInput>(),
      dataToSearch: ref<string>(''),
      searchListOptions: ref<{ ticker: string; name: string }[]>([]),
      showSearchResultsMenu: ref<boolean>(false),
      showNoTransactionsDialog: ref<boolean>(false),
      defaultTax: ref<number>(0),
      decimalDigits: ref<number>(2),
      savingSettings: ref<boolean>(false),
      sendingFeedback: ref<boolean>(false),
      dateFormatOptions,
      searchTimer,
    };
  },
  methods: {
    searchKeyDown(e: KeyboardEvent) {
      if (/[^A-Za-z&]$/.test(e.key)) {
        e.preventDefault();
      }
    },
    sendFeedback() {
      this.sendingFeedback = true;
      api
        .post('user/contact', { feedback: this.feedback })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.showContactWindow = false;
            this.feedback = '';
            showNotification("Thank you for your feedback, we'll be in touch");
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.sendingFeedback = false;
        });
    },
    showContactUsWindow() {
      this.showContactWindow = true;
      this.showSettingsPopup = false;
    },
    showAnnouncements() {
      this.router.push({ path: '/announcements' });
    },
    gotoYearlyPaymentMatrix() {
      this.router.push({ path: '/yearlyPaymentMatrix' });
    },
    importTransactionsWindow() {
      this.showNoTransactionsDialog = true;
    },
    exportTransactions() {
      this.savingSettings = true;
      api
        .get('user/exportTransactions')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            let fileName = 'transactions.csv';
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.savingSettings = false;
        });
    },
    changePassword() {
      this.$q
        .dialog({
          position: 'bottom',
          title: 'Change password',
          message: 'Your current password',
          prompt: {
            model: '',
            isValid: (val: string) => val.length > 7,
            type: 'password',
          },
        })
        .onOk((oldPassword: string) => {
          this.$q
            .dialog({
              position: 'bottom',
              title: 'Change password',
              message: 'Your new password',
              prompt: {
                model: '',
                isValid: (val: string) => val.length > 7,
                type: 'password',
              },
            })
            .onOk((newPassword: string) => {
              this.savingSettings = true;
              api
                .patch('user/password', {
                  oldPassword: oldPassword,
                  newPassword: newPassword,
                })
                .then((response) => {
                  if (response.data.error) {
                    showNotification(response.data.error);
                  } else {
                    showNotification(
                      'Password was changed successfully, you must re-login'
                    );
                    this.logout();
                  }
                })
                .catch((err) => {
                  showAPIError(err);
                })
                .finally(() => {
                  this.savingSettings = false;
                });
            });
        });
    },
    gotoOverview() {
      this.router.push({ path: '/overview' });
    },
    gotoDonate() {
      window.open('https://www.paypal.me/StockDiv', '_blank');
    },
    saveSettings() {
      if (!this.userNameEdit) return;
      if (!this.defaultTax) this.defaultTax = 0;
      if (!this.decimalDigits) this.decimalDigits = 2;
      this.savingSettings = true;
      axios
        .all([
          api.patch('user/settings', {
            fields: ['dateFormat', 'decimalDigits', 'defaultTax'],
            values: [this.dateFormat, this.decimalDigits, this.defaultTax],
          }),
          api.patch('user/name', { name: this.userNameEdit }),
        ])
        .then(
          axios.spread(async (...responses) => {
            if (responses[0].data.error) {
              showNotification(responses[0].data.error);
            } else if (responses[1].data.error) {
              showNotification(responses[1].data.error);
            } else {
              this.showSettingsPopup = false;
              this.store.settings.defaultTax = this.defaultTax;
              this.store.settings.dateFormat = this.dateFormat;
              this.store.settings.decimalDigits = this.decimalDigits;
              this.userName = this.userNameEdit;
              bus.emit('changedSettings');
              showNotification('Settings were saved successfully');
            }
          })
        )
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.savingSettings = false;
        });
    },
    addManualTransaction() {
      this.showNoTransactionsDialog = false;
      this.showSettingsPopup = false;
      setTimeout(() => {
        this.setFocusOnSearch();
      }, 150);
    },
    logout() {
      this.store.portfolios = [];
      this.store.token = '';
      this.router.push({ path: '/' });
    },
    gotoTickerPage(ticker: string) {
      if (ticker === 'Nothing found') return;
      if (this.router.currentRoute.value.fullPath.includes('screener')) {
        this.loginLoading = true;
        api
          .patch(`screener/ticker/${ticker}`)
          .then((response) => {
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              bus.emit('reloadScreener');
            }
          })
          .catch((err) => {
            showAPIError(err);
          })
          .finally(() => {
            this.loginLoading = false;
          });
      } else {
        this.router.push({
          path: `/ticker/${ticker}`,
        });
      }
      this.dataToSearch = '';
    },
    setFocusOnSearch() {
      if (this.searchTickerInput) this.searchTickerInput.focus();
    },
    getSearchOptions() {
      if (this.dataToSearch === '') return;
      this.showSearchResultsMenu = false;
      api
        .get(
          `ticker/search?searchText=${this.dataToSearch.replace('&', '%26')}`
        )
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.searchListOptions = response.data;
            this.showSearchResultsMenu = true;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    searchTimeOut() {
      if (this.searchTimer !== -1) {
        clearTimeout(this.searchTimer);
        this.searchTimer = -1;
      }
      this.searchTimer = window.setTimeout(() => {
        this.getSearchOptions();
      }, 250);
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
          this.csvToImport = null;
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
        this.csvToImport = null;
        showNotification('No tickers to import');
        return;
      }
      showNotification('Checking for invalid tickers');
      api
        .post('ticker/exist', tickersList)
        .then((response) => {
          if (response.data.error) {
            this.importInProcess = false;
            this.csvToImport = null;
            showNotification(response.data.error);
          } else if (response.data.length > 0) {
            this.importInProcess = false;
            this.csvToImport = null;
            showNotification(
              `Tickers ${response.data} were not found. Please remove them from the file and import it again`
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
              this.csvToImport = null;
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
                  importSharePrice = Math.abs(
                    Math.round((importPrice / importShares) * 10000) / 10000
                  );
                importDate = `${theLine[3]}`;
                importPortfolio = theLine[4].trim();
                importCurrency = 'USD';
                if (theLine.length > 6) importCurrency = theLine[6].trim();
                if (importCurrency === 'GBP' || importCurrency === 'ILS') {
                  importSharePrice *= 100;
                  if (importCurrency === 'GBP') importCurrency = 'GBX';
                  else importCurrency = 'ILA';
                }
                transactions.push({
                  ticker: importTicker,
                  portfolio: importPortfolio,
                  sharePrice: importSharePrice,
                  shares: importShares,
                  when: importDate,
                  currency: importCurrency,
                });
              }
              showNotification('Importing transactions, please wait...');
              this.importTransactions(transactions);
            }
          }
        })
        .catch((err) => {
          this.importInProcess = false;
          this.csvToImport = null;
          showAPIError(err);
        });
    },
    importTransactions(transactions: ITransactionData[]) {
      const notification = setTimeout(() => {
        showNotification(
          'You have many transactions, loading may take longer than expected...'
        );
      }, 20000);
      api
        .post('transaction', { transactions })
        .then((response) => {
          clearTimeout(notification);
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.importInProcess = false;
            showNotification('Transactions were successfully imported');
            bus.emit('transactionChange');
          }
        })
        .catch((err) => {
          clearTimeout(notification);
          this.importInProcess = false;
          this.csvToImport = null;
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
      this.dateFormat = this.store.settings.dateFormat;
      this.defaultTax = this.store.settings.defaultTax;
      this.decimalDigits = this.store.settings.decimalDigits;
      this.showSettingsPopup = true;
    },
    runOnLoginSuccess() {
      this.loginLoading = true;
      axios
        .all([
          api.get('user/name'),
          api.get('portfolio/all'),
          api.get('user/settings'),
          api.get('user/messages'),
        ])
        .then(
          axios.spread(async (...responses) => {
            this.userName = responses[0].data;
            this.store.portfolios = responses[1].data;
            if (responses[1].data.length === 2) {
              this.store.selectedPortfolio = responses[1].data[1];
            } else this.store.selectedPortfolio = responses[1].data[0];
            this.showNoTransactionsDialog = this.store.portfolios.length === 0;
            this.store.settings = responses[2].data;
            this.store.announcements = responses[3].data;
            if (this.showNoTransactionsDialog) return;
            if (this.router.currentRoute.value.fullPath === '/')
              this.router.push({ path: '/overview' });
            else if (this.router.currentRoute.value.fullPath.includes('ticker'))
              bus.emit('updateTickerPage');
            else if (
              this.router.currentRoute.value.fullPath.includes('overview')
            )
              bus.emit('changedPortfolio');
          })
        )
        .catch((err: AxiosError) => {
          showAPIError(err);
        })
        .finally(() => {
          this.loginLoading = false;
        });
    },
    changePortfolio() {
      bus.emit('changedPortfolio');
    },
  },
  mounted() {
    bus.on('transactionChange', this.runOnLoginSuccess);
    bus.on('searchTickerFocus', this.setFocusOnSearch);
  },
  beforeUnmount() {
    bus.off('transactionChange', this.runOnLoginSuccess);
    bus.off('searchTickerFocus', this.setFocusOnSearch);
  },
});
</script>
<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  opacity: 0;
}
.logo {
  width: 32px;
  height: 32px;
  margin: 5px;
}
</style>
