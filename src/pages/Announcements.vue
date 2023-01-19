<template>
  <q-page class="column q-pa-md">
    <div class="cursor-pointer text-blue-7 text-center" @click="markAsRead()">
      Mark all messages as read
    </div>
    <q-card
      class="text-center shadow-8 bg-light-blue-1 q-ma-md"
      v-for="(item, i) in messages"
      v-bind:key="i"
    >
      <q-card-section>
        {{ item.theDate }}
        <q-separator />
      </q-card-section>
      <q-card-section>
        {{ item.theMessage }}
      </q-card-section>
    </q-card>
    <q-inner-loading :showing="messagesLoading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { showAPIError, showNotification } from 'src/utils/utils';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { stockdivStore } from 'stores/stockdivStore';

export default defineComponent({
  name: 'AnnouncementsPage',
  setup() {
    const router = useRouter();
    const store = stockdivStore();
    return {
      store,
      router,
      messages: ref<{ theDate: string; theMessage: string }[]>([]),
      messagesLoading: ref<boolean>(false),
    };
  },
  mounted() {
    if (this.store.token === '') {
      showNotification('You will need to re-login');
      this.router.push('/');
    } else {
      this.runGetMessages();
    }
  },
  methods: {
    markAsRead() {
      this.messagesLoading = true;
      api
        .patch('user/lastReadMessages')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            showNotification('Mark as read updated successfully');
            this.store.announcements = [];
            this.router.push({ path: '/overview' });
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.messagesLoading = false;
        });
    },
    runGetMessages() {
      this.messagesLoading = true;
      api
        .get('user/messages')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.messages = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.messagesLoading = false;
        });
    },
  },
});
</script>
