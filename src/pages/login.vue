<template>
  <q-page class="row items-center justify-evenly">
    <div class="column items-center">
      <q-img src="logo.png" />

      <q-card class="shadow-8 bg-light-blue-1">
        <q-form class="q-pa-lg">
          <div class="text-weight-bold row justify-center">
            Your portfolio. Your income.
          </div>
          <q-input
            v-model="email"
            autofocus
            ref="refEmail"
            type="email"
            label="Email"
            class="q-my-sm"
          />

          <q-input
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            label="Password"
            class="q-my-sm"
            @keyup.enter="letMeIn()"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="rePassword"
            v-show="newUser"
            ref="refRePassword"
            :type="isRePwd ? 'password' : 'text'"
            label="Confirm password"
            class="q-my-sm"
          >
            <template v-slot:append>
              <q-icon
                :name="isRePwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isRePwd = !isRePwd"
              />
            </template>
          </q-input>

          <div class="row">
            <q-toggle
              v-model="newUser"
              color="primary"
              keep-color
              label="New User"
              @click="focusRePassword()"
            />
            <q-toggle
              v-model="rememberMe"
              color="primary"
              keep-color
              disabled="true"
              label="Remember me"
            />
          </div>
          <q-input
            v-model="confirmationCode"
            type="text"
            ref="confirmationCodeRef"
            hint="A confirmation code was sent to your email"
            v-show="codeSent"
          />
          <div class="row justify-center">
            <q-btn
              class="q-mt-sm cursor-pointer"
              push
              color="primary"
              text-color="white"
              label="Let me in"
              :disable="disableLetMeIn"
              @click="letMeIn()"
            />
          </div>

          <div class="row q-my-sm">
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openPrivacyPolicyDialog"
                >Privacy policy</a
              >
            </div>
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openDisclaimerDialog">Disclaimer</a>
            </div>
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openWhyEmailDialog"> Why email? </a>
            </div>
          </div>
        </q-form>
        <q-inner-loading :showing="disableLetMeIn">
          <q-spinner-hourglass size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { api } from '../boot/axios';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { QInput } from 'quasar';
import { stockdivStore } from 'src/stores/stockdivStore';
import {
  bus,
  showAPIError,
  showNotification,
  validateEmail,
} from 'src/utils/utils';

export default defineComponent({
  name: 'loginPage',
  components: {},

  setup() {
    const store = stockdivStore();

    return {
      password: ref(''),
      rePassword: ref(''),
      isPwd: ref(true),
      isRePwd: ref(true),
      email: ref(''),
      refRePassword: ref<QInput>(),
      refEmail: ref<QInput>(),
      newUser: ref(false),
      rememberMe: ref(false),
      confirmationCode: ref(''),
      codeSent: ref(false),
      disableLetMeIn: ref<boolean>(false),
      store,
      confirmationCodeRef: ref<QInput>(),
    };
  },
  methods: {
    openDisclaimerDialog() {
      this.$q.dialog({
        title: 'StockDiv',
        message:
          'Disclaimer: StockDiv and the information contained herein is not intended to be a source of advice or credit Analysis with respect to the material presented, and the information and/or documents contained in StockDiv do not constitute an investment advice. The information contained in StockDiv is for general information purposes only. You should not rely upon the information on StockDiv as a basis for making any business, legal or any other decisions.',
        html: false,
      });
    },
    openPrivacyPolicyDialog() {
      this.$q.dialog({
        title: 'StockDiv',
        message:
          "Privacy Policy: The application collects only the following user's data: email, password (encrypted) and transactions list as entered by the user. This data won't be sold to any 3rd party. The data is stored in Google Firebase.",
        html: false,
      });
    },
    openWhyEmailDialog() {
      this.$q.dialog({
        title: 'StockDiv',
        message:
          "Your email will only be used for support, account deletion and password change. Your email won't be sold nor given to any third party whatsoever. A confirmation code will be sent to make sure the email is yours.",
        html: false,
      });
    },
    focusRePassword() {
      setTimeout(() => {
        if (this.newUser && this.refRePassword && this.email !== '')
          this.refRePassword.focus();
        else if (this.refEmail) this.refEmail.focus();
      }, 250);
    },
    letMeIn() {
      if (!validateEmail(this.email)) {
        showNotification('Invalid email');
        return;
      } else if (this.password.length < 8) {
        showNotification('Password must have at least 8 characters');
        return;
      } else if (this.newUser && this.password !== this.rePassword) {
        showNotification('Passwords do not match');
        return;
      }
      const command = this.codeSent || !this.newUser ? 'login' : 'register';
      this.disableLetMeIn = true;
      api
        .post(`user/${command}`, {
          email: this.email,
          password: this.password,
          confirmationCode: this.codeSent ? this.confirmationCode : undefined,
        })
        .then((response) => {
          if (response.data.result || response.data.token) {
            if (response.data.result) {
              this.codeSent = true;
              setTimeout(() => {
                this.confirmationCodeRef?.focus();
              }, 500);
            } else {
              this.store.token = response.data.token;
              bus.emit('transactionChange');
            }
          } else {
            showNotification(
              response.data.error
                ? response.data.error
                : 'Oops, there was a problem'
            );
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.disableLetMeIn = false;
        });
    },
  },
});
</script>
