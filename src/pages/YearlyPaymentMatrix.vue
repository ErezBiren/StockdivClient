<template>
  <q-page class="q-pa-md">
    <q-card class="text-center shadow-8 bg-light-blue-1">
      <q-card-section>
        <q-markup-table
          separator="cell"
          flat
          dense
          class="bg-light-blue-1"
          style="max-height: 81vh"
        >
          <thead>
            <tr>
              <th class="bg-green-2"><b>Ticker</b></th>
              <th class="bg-green-2">Jan</th>
              <th class="bg-green-2">Feb</th>
              <th class="bg-green-2">Mar</th>
              <th class="bg-green-2">Apr</th>
              <th class="bg-green-2">May</th>
              <th class="bg-green-2">Jun</th>
              <th class="bg-green-2">Jul</th>
              <th class="bg-green-2">Aug</th>
              <th class="bg-green-2">Sep</th>
              <th class="bg-green-2">Oct</th>
              <th class="bg-green-2">Nov</th>
              <th class="bg-green-2">Dec</th>
              <th class="bg-green-2"><b>Total</b></th>
              <th class="bg-green-2">Jan</th>
              <th class="bg-green-2">Feb</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in matrixData" v-bind:key="i">
              <td>
                <b>{{ item[0] }}</b>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[1][1])">
                  {{
                    item[1][0] === 0 ? '' : filters.formatToCurrency(item[1][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[2][1])">
                  {{
                    item[2][0] === 0 ? '' : filters.formatToCurrency(item[2][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[3][1])">
                  {{
                    item[3][0] === 0 ? '' : filters.formatToCurrency(item[3][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[4][1])">
                  {{
                    item[4][0] === 0 ? '' : filters.formatToCurrency(item[4][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[5][1])">
                  {{
                    item[5][0] === 0 ? '' : filters.formatToCurrency(item[5][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[6][1])">
                  {{
                    item[6][0] === 0 ? '' : filters.formatToCurrency(item[6][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[7][1])">
                  {{
                    item[7][0] === 0 ? '' : filters.formatToCurrency(item[7][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[8][1])">
                  {{
                    item[8][0] === 0 ? '' : filters.formatToCurrency(item[8][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[9][1])">
                  {{
                    item[9][0] === 0 ? '' : filters.formatToCurrency(item[9][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[10][1])">
                  {{
                    item[10][0] === 0
                      ? ''
                      : filters.formatToCurrency(item[10][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[11][1])">
                  {{
                    item[11][0] === 0
                      ? ''
                      : filters.formatToCurrency(item[11][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[12][1])">
                  {{
                    item[12][0] === 0
                      ? ''
                      : filters.formatToCurrency(item[12][0])
                  }}
                </div>
              </td>
              <td>
                {{
                  item[13][0] === 0 ? '' : filters.formatToCurrency(item[13][0])
                }}
              </td>
              <td>
                <div :class="getMatrixCellColor(item[14][1])">
                  {{
                    item[14][0] === 0
                      ? ''
                      : filters.formatToCurrency(item[14][0])
                  }}
                </div>
              </td>
              <td>
                <div :class="getMatrixCellColor(item[15][1])">
                  {{
                    item[15][0] === 0
                      ? ''
                      : filters.formatToCurrency(item[15][0])
                  }}
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>{{ `${matrixData ? matrixData.length : 0} assets` }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[1]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[2]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[3]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[4]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[5]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[6]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[7]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[8]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[9]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[10]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[11]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[12]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[13]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[14]) }}</th>
              <th>{{ filters.formatToCurrency(matrixDataFooter[15]) }}</th>
            </tr>
          </tfoot>
        </q-markup-table>
      </q-card-section>
      <q-inner-loading :showing="yearlyPaymentLoading">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import { showAPIError } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';
import { filters } from '../utils/utils';
export default defineComponent({
  name: 'YearlyPaymentMatrix',

  setup() {
    const store = stockdivStore();
    return {
      yearlyPaymentLoading: ref<boolean>(false),
      store,
      filters,
      matrixData:
        ref<
          [
            string,
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number],
            [number, number]
          ][]
        >(),
      matrixDataFooter: ref<
        [
          string,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number
        ]
      >(['', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    };
  },
  methods: {
    getMatrixCellColor(cellContentType: number): string {
      switch (cellContentType) {
        case 0:
          return 'text-received';
        case 1:
          return 'text-remain';
        case 2:
          return 'text-projected';
        default:
          return 'text-projected';
      }
    },
  },
  mounted() {
    this.yearlyPaymentLoading = true;
    axios
      .all([
        api.get(
          `dividend/portfolio/${this.store.selectedPortfolio}/yearlyPaymentMatrix`
        ),
      ])
      .then(
        axios.spread(async (...responses) => {
          this.matrixData = responses[0].data.matrixData;
          this.matrixDataFooter = responses[0].data.matrixFooter;
        })
      )
      .catch((err: AxiosError) => {
        showAPIError(err);
      })
      .finally(() => {
        this.yearlyPaymentLoading = false;
      });
  },
});
</script>
<style>
table thead,
table tfoot {
  position: sticky;
  z-index: 1;
}
table thead {
  inset-block-start: 0;
}
table tfoot {
  inset-block-end: 0;
  background: #e1f5fe;
}

.text-received {
  color: #4b914b !important;
}

.text-remain {
  color: hsl(195, 43%, 52%) !important;
}

.text-projected {
  color: #8f469e !important;
}
</style>
