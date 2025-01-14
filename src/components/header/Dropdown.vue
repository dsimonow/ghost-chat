<template>
    <details
        id="app-menu"
        role="list"
    >
        <summary
            id="menu"
            aria-haspopup="listbox"
            role="button"
            class="secondary"
        >
            <span><font-awesome-icon icon="fas fa-bars" /></span>
        </summary>
        <ul role="listbox">
            <li v-if="!isStartPage">
                <a @click="emit('showStart')">{{ t('header.dropdown.start') }}</a>
            </li>
            <li v-if="!props.isChatPage && props.channel !== ''">
                <a @click="emit('showChat')">{{ t('header.dropdown.chat') }}</a>
            </li>
            <li v-if="!isSettingsOpen">
                <a @click="showSettings">{{ t('header.dropdown.settings') }}</a>
            </li>
            <!-- <li v-if="!isSettingsOpen">
                <a @click="setClickThrough">{{ t('header.dropdown.set-click-through') }}</a>
            </li> -->
            <li>
                <a @click="toggleTheme">{{ t('header.dropdown.toggle-color-theme') }}</a>
            </li>
            <li
                v-if="!isSettingsOpen && (isChatPage || isExternalPage)"
                id="vanish"
            >
                <a @click="emitVanish">
                    <font-awesome-icon icon="fas fa-ghost" />
                    <span>{{ t('header.dropdown.vanish.title') }}</span>
                </a>
                <span
                    :data-tooltip="t('header.dropdown.vanish.tooltip')"
                    data-placement="bottom"
                >?</span>
            </li>
        </ul>
    </details>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { IpcEvent } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

const { t } = useI18n();

const props = defineProps<{
    isChatPage: boolean;
    isExternalPage: boolean;
    isStartPage: boolean;
    channel: string;
    store: ElectronStore<AppStore>;
}>();

const emit = defineEmits(['showChat', 'showStart', 'showSettings', 'vanish']);

const isSettingsOpen = ref(false);

if (props.store.get('settings').isOpen) {
    isSettingsOpen.value = true;
}

const showSettings = () => {
    document.querySelector('details')?.removeAttribute('open');
    isSettingsOpen.value = true;
    ipcRenderer.send(IpcEvent.OpenSettings);
};

const toggleTheme = () => {
    const $html = document.querySelector('html');
    const theme = $html?.getAttribute('data-theme');

    if (theme && theme === 'dark') {
        $html?.setAttribute('data-theme', 'light');
        props.store.set('savedWindowState.theme', 'light');
        props.store.set('settings.savedWindowState.theme', 'light');
    } else {
        $html?.setAttribute('data-theme', 'dark');
        props.store.set('savedWindowState.theme', 'dark');
        props.store.set('settings.savedWindowState.theme', 'dark');
    }

    ipcRenderer.send(IpcEvent.Rerender, 'child');
};

// const setClickThrough = () => {
//     document.querySelector('details')?.removeAttribute('open');
//     ipcRenderer.send(IpcEvent.SetClickThrough);
// };

const emitVanish = () => {
    document.querySelector('details')?.removeAttribute('open');
    emit('vanish');
};
</script>
