import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// eslint-disable-next-line import/no-unresolved
import messages from '@intlify/unplugin-vue-i18n/messages';
import ElectronStore from 'electron-store';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import { AppStore } from '../shared/types';

import './assets/scss/main.scss';
import './components/fontAwesome';

import App from './App.vue';

const store = new ElectronStore<AppStore>();

const i18n = createI18n<false>({
    locale: store.get('general').language,
    fallbackLocale: 'en-US',
    messages,
    legacy: false,
});

createApp(App)
    .use(i18n)
    .component('FontAwesomeIcon', FontAwesomeIcon)
    .mount('#app');
