import { addTab as addTabToDB, deleteTab as deleteTabFromDB } from '../../../utils/storage';
import { TabSlice, BoardStoreCreator } from './types';

export const createTabSlice: BoardStoreCreator<TabSlice> = set => ({
    tabs: [],

    addTab: tab => {
        const newTab = {
            ...tab,
            createdAt: new Date().toISOString(),
        };

        set(state => ({
            tabs: [...state.tabs, newTab],
        }));

        addTabToDB(newTab).catch(console.error);

        chrome.runtime
            .sendMessage({
                type: 'ADD_TAB',
                payload: newTab,
            })
            .catch(console.error);
    },

    updateTab: (id, updates) =>
        set(state => ({
            tabs: state.tabs.map(tab => (tab.id === id ? { ...tab, ...updates } : tab)),
        })),

    deleteTab: id => {
        set(state => ({
            tabs: state.tabs.filter(tab => tab.id !== id),
        }));

        deleteTabFromDB(id).catch(console.error);

        chrome.runtime
            .sendMessage({
                type: 'DELETE_TAB',
                payload: { id },
            })
            .catch(console.error);
    },

    deleteTabSilently: id => {
        set(state => ({
            tabs: state.tabs.filter(tab => tab.id !== id),
        }));

        deleteTabFromDB(id).catch(console.error);
    },

    moveTab: (tabId, newFolderId) =>
        set(state => ({
            tabs: state.tabs.map(tab => (tab.id === tabId ? { ...tab, folderId: newFolderId } : tab)),
        })),
});
