import { create } from 'zustand';
import type { Article, Tag, Category } from '../types';

interface AppState {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;

  articles: Article[];
  setArticles: (articles: Article[]) => void;

  tags: Tag[];
  setTags: (tags: Tag[]) => void;

  categories: Category[];
  setCategories: (categories: Category[]) => void;

  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  articles: [],
  setArticles: (articles) => set({ articles }),

  tags: [],
  setTags: (tags) => set({ tags }),

  categories: [],
  setCategories: (categories) => set({ categories }),

  selectedArticle: null,
  setSelectedArticle: (article) => set({ selectedArticle: article }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
