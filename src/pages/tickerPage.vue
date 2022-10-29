<template>
  <q-page padding>
    <q-card class="justify-center text-center shadow-10">
      <q-card-section
        ><q-img :src="tickerLogo" style="height: 32px; max-width: 32px" /><br />
        {{ ticker }}: {{ tickerName }}
      </q-card-section>
      <q-separator />
      <q-card-actions class="justify-center row no-wrap">
        <q-icon
          name="add_shopping_cart"
          class="cursor-pointer q-ml-md q-mr-md"
          size="sm"
          @click="addPurchase()"
          ><q-tooltip>Add transaction</q-tooltip></q-icon
        >
        <q-icon
          name="edit"
          class="cursor-pointer q-ml-md q-mr-md"
          size="sm"
          @click="changeTicker()"
          ><q-tooltip>Change ticker</q-tooltip></q-icon
        >
        <q-icon
          name="call_split"
          class="cursor-pointer q-ml-md q-mr-md"
          size="sm"
          @click="splitTicker()"
          ><q-tooltip
            >Split: Automatically recalculate shares and share price</q-tooltip
          ></q-icon
        >
      </q-card-actions>
    </q-card>
  </q-page>

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
          ><q-tooltip>Close</q-tooltip></q-icon
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
        >
        </q-input
        ><q-icon
          name="edit"
          size="sm"
          @click="setNewTicker()"
          class="cursor-pointer q-mt-sm"
          ><q-tooltip
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
        <q-spinner-gears size="50px" color="primary" />
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
          ><q-tooltip>Close</q-tooltip></q-icon
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
          ><q-tooltip
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
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>

  <q-dialog v-model="addPurchaseDialogShow" position="bottom">
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
            ><q-tooltip>Close</q-tooltip></q-icon
          >
        </q-card-section>
        <q-separator />
        <q-card-section class="row no-wrap">
          <q-input
            dense
            readonly
            hint="When"
            mask="####-##-##"
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
            </template>
          </q-input>
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
            :rules="[(val) => (val && val > 0) || 'Quantity is missing']"
          >
            <q-tooltip>
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
            hint="Share price"
            :prefix="getCurrencySymbol"
            :rules="[(val) => (val && val > 0) || 'Price is missing']"
          >
            <template v-slot:before>
              <q-icon
                dense
                flat
                name="request_quote"
                @click="getPrice()"
                size="xs"
                class="cursor-pointer"
              >
                <q-tooltip>Get price (based on selected date)</q-tooltip>
              </q-icon>
            </template>
          </q-input>

          <q-input
            dense
            style="width: 125px"
            v-model.number="newTransactionTotal"
            @keyup="totalChange"
            @change="totalChange"
            type="number"
            step="0.0001"
            hint="Total price"
            :prefix="getCurrencySymbol"
            :rules="[(val) => (val && val > 0) || 'Total is missing']"
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
            <q-tooltip>Save</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-form>
      <q-inner-loading :showing="serverProcessing">
        <q-spinner-gears size="50px" color="primary" />
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
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { stockdivStore } from '../stores/stockdivStore';
import { ITransactionData } from 'src/utils/interfaces/ITransactionData';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'tickerPage',

  setup() {
    const store = stockdivStore();
    function eventOptions(date: string) {
      return date <= getTodayDate(false).replace(/-/g, '/');
    }
    const router = useRouter();
    return {
      ticker: ref<string>(''),
      tickerName: ref<string>(),
      tickerCurrency: ref<string>('USD'),
      tickerPortfolio: ref<string>('All Portfolios'),
      newTransactionPortfolio: ref<string>(''),
      addPurchaseDialogShow: ref<boolean>(false),
      changeTickerDialogShow: ref<boolean>(false),
      exchangeCode: ref<string>(),
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
      store,
      router,
      eventOptions,
    };
  },
  methods: {
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
            this.serverProcessing = false;
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              this.splitTickerDialogShow = false;
              showNotification('Ticker was splitted successfully');
              //todo: amos - reload transactions of shares
            }
          })
          .catch((err) => {
            this.serverProcessing = false;
            showAPIError(err);
          });
      }
    },
    resetNewTransaction() {
      this.newTransactionSharePrice = 0;
      this.newTransactionShares = 0;
      this.newTransactionTotal = 0;
      this.newTransactionWhen = getTodayDate(false);
    },
    setNewPortfolio(val: string) {
      this.newTransactionPortfolio = val;
    },
    getPrice() {
      this.serverProcessing = true;
      api
        .get(
          `ticker/${this.ticker}/price?toCurrency=${this.tickerCurrency}&ofDate=${this.newTransactionWhen}`
        )
        .then((response) => {
          this.serverProcessing = false;
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.newTransactionSharePrice = response.data;
            this.sharePriceChange();
          }
        })
        .catch((err) => {
          this.serverProcessing = false;
          showAPIError(err);
        });
    },
    sharePriceChange() {
      if (!this.newTransactionSharePrice) return;
      if (this.newTransactionShares === 0) this.newTransactionShares = 1;
      this.newTransactionTotal = Math.round(this.newTransactionShares * this.newTransactionSharePrice * 1000) / 1000;
    },
    totalChange() {
      if (!this.newTransactionTotal) return;
      if (this.newTransactionShares === 0) this.newTransactionShares = 1;
      this.newTransactionSharePrice = Math.round(this.newTransactionTotal / this.newTransactionShares * 1000) / 1000;
    },
    sharesChange() {
      if (!this.newTransactionShares) return;
      this.newTransactionTotal = Math.round(this.newTransactionShares * this.newTransactionSharePrice * 1000) / 1000;        
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
            this.serverProcessing = false;
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              this.changeTickerDialogShow = false;
              showNotification('Ticker was changed successfully');
              this.router.push({
                path: `/ticker/${this.store.selectedPortfolio}/${this.newTicker}`,
              });
              this.newTicker = '';
            }
          })
          .catch((err) => {
            this.serverProcessing = false;
            showAPIError(err);
          });
      }
    },
    submitNewTransaction() {
      const transactions: ITransactionData[] = [];
      transactions.push({
        ticker: this.ticker,
        portfolio: this.newTransactionPortfolio,
        sharePrice: this.newTransactionSharePrice,
        shares: this.newTransactionShares,
        when: `${this.newTransactionWhen}T00:00:00.000Z`,
        currency: this.tickerCurrency,
      });
      this.serverProcessing = true;
      api
        .post('transaction', transactions)
        .then((response) => {
          this.serverProcessing = false;
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.addPurchaseDialogShow = false;
            showNotification('The transaction was added successfully');
            this.resetNewTransaction();
            bus.emit('transactionChange', {});
          }
        })
        .catch((err) => {
          this.serverProcessing = false;
          showAPIError(err);
        });
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
    getTickerLogo() {
      api
        .get(`ticker/${this.ticker}/logo`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.tickerLogo = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getTickerName() {
      api
        .get(`ticker/${this.ticker}/name`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.tickerName = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getTickerCurrency() {
      api
        .get(`ticker/${this.ticker}/currency`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.tickerCurrency = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
  },
  mounted() {
    this.ticker = useRoute().params.ticker as string;
    this.tickerPortfolio = useRoute().params.portfolio as string;
    if (this.tickerPortfolio !== 'All Portfolios')
      this.newTransactionPortfolio =
        this.tickerPortfolio === 'undefined'
          ? 'Portfolio'
          : this.tickerPortfolio;
    else this.newTransactionPortfolio = this.store.portfolios[0];
    this.getTickerName();
    this.getTickerLogo();
    this.getTickerCurrency();
  },
  computed: {
    getCurrencySymbol(): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.tickerCurrency,
      })
        .format(1)
        .substring(0, 1);
    },
  },
});
</script>
<style>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  opacity: 0;
}
</style>
