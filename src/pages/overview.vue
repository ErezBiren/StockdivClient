<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="text-weight-bold">Hello {{ userName }},</div>
      <q-icon
        class="q-mx-xs cursor-pointer"
        name="edit"
        @click="setUserName()"
        size="sm"
        ><q-tooltip>Update your name</q-tooltip></q-icon
      >
    </div>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { stockdivStore } from 'src/stores/stockdivStore';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'overView',
  setup() {
    const store = stockdivStore();
    return {
      userName: ref<string>(''),
      store,
    };
  },
  methods: {
    setUserName() {
      this.$q
        .dialog({
          title: 'Update your name',
          message: 'What is your name?',
          prompt: {
            model: '',
            type: 'text',
          },
          cancel: true,
        })
        .onOk((data) => {
          if (data.trim() === '') {
            this.$q.notify({
              message: 'Your name was missing',
            });
          } else {
            api
              .put(
                '/user/name',
                { name: data },
                {
                  headers: {
                    Authorization: `Bearer ${this.store.token}`,
                  },
                }
              )
              .then((response) => {
                if (response.data.error) {
                  this.$q.notify({
                    message: response.data.error,
                  });
                } else {
                  this.$q.notify({
                    message: 'Your name was updated',
                  });
                  this.getUserName();
                }
              })
              .catch((error) => {
                console.log(error);
                const err = error.response?.data
                  ? error.response?.data.error
                  : error.message;
                this.$q.notify({
                  message: err,
                });
              });
          }
        });
    },
    getUserName() {
      api
        .get('user/name', {
          headers: {
            Authorization: `Bearer ${this.store.token}`,
          },
        })
        .then((response) => {
          this.userName = response.data.name;
        })
        .catch((error) => {
          const err = error.response?.data
            ? error.response?.data.error
            : error.message;
          this.$q.notify({
            message: err,
          });
        });
    },
  },
  mounted() {
    this.getUserName();
  },
});
</script>
