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

export const showAPIError = (apiError: AxiosError) => {
  let helper: AxiosResponse | null = null;
  let err: string;
  if (apiError.response) helper = apiError.response;
  if (helper == null) err = apiError.message; else err = helper.data.error;
  showNotification(err);
};

export const getTodayDate = (full: boolean): string => {
  let str = new Date().toISOString();
  if (!full) str = str.substring(0, 10);
  return str;
};
