import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ArticleList } from './pages/Articles';
import { Editor } from './pages/Editor';
import { Settings } from './pages/Settings';
import { Images } from './pages/Images';
import { Deploy } from './pages/Deploy';
import { useAppStore } from './stores/appStore';

const App: React.FC = () => {
  const { darkMode } = useAppStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890FF',
          colorBgContainer: darkMode ? '#1F1F1F' : '#fff',
          colorBgLayout: darkMode ? '#141414' : '#F5F5F5',
          colorText: darkMode ? '#fff' : '#262626',
          colorBorder: darkMode ? '#434343' : '#D9D9D9',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="editor/:id" element={<Editor />} />
              <Route path="images" element={<Images />} />
              <Route path="deploy" element={<Deploy />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
