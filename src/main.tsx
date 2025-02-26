import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
// import 'dotenv/config'
import { createBrowserRouter, createRoutesFromElements, Route, Navigate, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import { QueryClient as ReactQueryClient, QueryClientProvider } from '@tanstack/react-query'

import './seedInit'
import ItemPage from './pages/ItemPage'
import TrashPage from './pages/TrashPage'
import ModelsPage from './pages/ModelsPage'
import ItemsPage from './pages/ItemsPage'

const queryClient = new ReactQueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route
      path={'trash'}
      element={<TrashPage />}
    />
    <Route
      path='/'
      element={<App />}
    >
      <Route
        index
        element={
          <Navigate
            to='/Models'
            replace
          />
        }
      />
      <Route
        path='Models'
        element={<ModelsPage />}
      />
      <Route
        path='Models/:modelName'
        element={<ModelsPage />}
      />
      <Route
        path='Items'
        element={<ItemsPage />}
      />
      <Route
        path='Items/:modelName'
        element={<ItemsPage />}
      />
    </Route>
  </>,
  ),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
