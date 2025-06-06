import { defineStore } from "pinia";

const LOCAL_STORAGE_KEY = "prohibitedWords";

const DEFAULT_PROHIBITED_WORDS = [
    "badword1",
    "badword2",
    "badword3",
];

export interface ProhibitedWordState {
    prohibitedWords: string[];
    defaultWords: string[];
}

export const useProhibitedWordStore = defineStore("prohibitedWords", {
    state: (): ProhibitedWordState => ({
        prohibitedWords: [],
        defaultWords: [...DEFAULT_PROHIBITED_WORDS],
    }),

    getters: {
        getProhibitedWords(state): string[] {
            return state.prohibitedWords;
        }
    },

    actions: {
        initializeWords() {
            const storedWords = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedWords) {
                try {
                    this.prohibitedWords = JSON.parse(storedWords);
                } catch (e) {
                    this.prohibitedWords = [...DEFAULT_PROHIBITED_WORDS];
                    this._saveWords(); 
                }
            } else {
                this.prohibitedWords = [...DEFAULT_PROHIBITED_WORDS];
                this._saveWords(); 
            }
        },

        _saveWords() {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.prohibitedWords));
        },

        addProhibitedWord(word: string) {
            if (!word || typeof word !== "string") return;
            const lowerWord = word.trim().toLowerCase();
            if (lowerWord && !this.prohibitedWords.includes(lowerWord)) {
                this.prohibitedWords.push(lowerWord);
                this._saveWords();
            }
        },

        removeProhibitedWord(word: string) {
            if (!word || typeof word !== "string") return;
            const lowerWord = word.trim().toLowerCase();
            this.prohibitedWords = this.prohibitedWords.filter(w => w !== lowerWord);
            this._saveWords();
        },

        isProhibited(text: string): boolean {
            if (!text || typeof text !== "string") return false;
            const lowerText = text.toLowerCase();
            return this.prohibitedWords.some(word => lowerText.includes(word));
        },

        resetToDefault() {
            this.prohibitedWords = [...this.defaultWords];
            this._saveWords();
        }
    }
})