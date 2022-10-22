<template>
  <q-page
    class="row justify-center q-pt-sm"
    v-if="store.token !== '' && hasTransactions"
  >
  blah blah
  </q-page>
</template>

<script lang="ts">
import { bus } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { stockdivStore } from '../stores/stockdivStore';

export default defineComponent({
  name: 'overView',
  setup() {
    const store = stockdivStore();

    return {
      store,
      hasTransactions: ref<boolean>(false),
    };
  },
  methods: {
    runWhenHasTransactions(has: boolean) {
      this.hasTransactions = has;
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
