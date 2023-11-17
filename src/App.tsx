import { Route, RouteObject, Routes, useRoutes } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import './App.css'
import Home from './Home'

function App() {

  /**
   * 路由信息
   */
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Home />
    }
  ]

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div className="app">
        {useRoutes(routes)}
      </div>
    </ConfigProvider>
  );
}

export default App;
