import { AxiosError, AxiosResponse } from 'axios';
import { EventBus, Notify } from 'quasar';

export const bus = new EventBus();

export const showNotification = (what: string) => {
  Notify.create({
    message: what,
    color: 'purple',
  });
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isNumber = (str: string): boolean => {
  if (typeof str !== 'string') {
    return false;
  }

  if (str.trim() === '') {
    return false;
  }

  return !Number.isNaN(Number(str));
};

export const showAPIError = (apiError: unknown) => {
  let err = 'Unknown error';
  if (apiError instanceof AxiosError) {
    let helper: AxiosResponse | null = null;
    if (apiError.response) helper = apiError.response;
    if (helper == null) err = apiError.message;
    else err = helper.data.error;
  } else if (apiError instanceof Error) err = apiError.message;
  showNotification(err);
};

export const getTodayDate = (full: boolean): string => {
  let str = new Date().toISOString();
  if (!full) str = str.substring(0, 10);
  return str;
};

export const filters = {
  formatToCurrency(value: number): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 4,
    });
    return formatter.format(value);
  },
  formatToPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  },
};

export const getCurrencySymbol = (currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  })
    .format(1)
    .substring(0, 1);
};
