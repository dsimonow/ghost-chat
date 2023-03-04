import { app, BrowserWindow, ipcMain } from 'electron';
import ElectronStore from 'electron-store';

import { IpcConstants, StoreKeys } from '../../shared/constants';
import { AppStore } from '../../shared/types';

import Settings from './window/settings';

export default class IpcEvents {
	private settings: BrowserWindow | null;

	constructor(private store: ElectronStore<AppStore>) {}

	registerEvents(overlay: BrowserWindow | null, indexHtml: string) {
		this.rerender(overlay);
		this.close();
		this.setClickThrough(overlay);
		this.minimize(overlay);
		this.vanish(overlay);
		this.openSettings(indexHtml);
	}

	private rerender(overlay: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Rerender, (_event: Electron.IpcMainEvent, args: any) => {
			if (args === 'child' && this.settings) {
				this.settings.webContents.send(IpcConstants.Rerender);
			}

			if (args === 'parent' && overlay) {
				overlay.webContents.send(IpcConstants.Rerender);
			}
		});
	}

	private close() {
		ipcMain.on(IpcConstants.Close, () => {
			for (const window of BrowserWindow.getAllWindows()) {
				window.close();
			}
		});
	}

	private setClickThrough(overlay: BrowserWindow | null) {
		ipcMain.on(IpcConstants.SetClickThrough, () => {
			this.store.set('savedWindowState.isClickThrough', true);
			overlay?.setIgnoreMouseEvents(true);
		});
	}

	private minimize(overlay: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Minimize, () => {
			overlay?.minimize();
		});
	}

	private vanish(overlay: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Vanish, () => {
			const windowBounds = overlay?.getBounds() as Electron.Rectangle;
			this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
				x: windowBounds.x,
				y: windowBounds.y,
				width: windowBounds.width,
				height: windowBounds.height,
				isClickThrough: true,
				isTransparent: true,
				theme: this.store.get('savedWindowState.theme'),
			});

			app.relaunch();
			app.exit();
		});
	}

	private openSettings(indexHtml: string) {
		ipcMain.on(IpcConstants.OpenSettings, () => {
			if (this.settings) {
				this.settings.focus();
			} else {
				const _settings = new Settings(this.store, this.destroyWindow.bind(this));
				_settings.buildWindow(indexHtml, 'settings');
				this.settings = _settings.window;
			}
		});
	}

	private destroyWindow() {
		this.settings = null;
	}
}