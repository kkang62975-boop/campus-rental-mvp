import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CampusSelectPage from './pages/CampusSelectPage'
import MapPage from './pages/MapPage'
import ItemListPage from './pages/ItemListPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import ChatPage from './pages/ChatPage'
import MyPage from './pages/MyPage'
import { trackPageView } from './lib/analytics'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return (
    <Routes>
      <Route path="/" element={<CampusSelectPage />} />
      <Route path="/:campusSlug/map" element={<MapPage />} />
      <Route path="/:campusSlug/items" element={<ItemListPage />} />
      <Route path="/:campusSlug/items/new" element={<ItemFormPage />} />
      <Route path="/:campusSlug/items/:itemId/edit" element={<ItemFormPage />} />
      <Route path="/:campusSlug/items/:itemId" element={<ItemDetailPage />} />
      <Route path="/:campusSlug/my" element={<MyPage />} />
      <Route path="/chat/:requestId" element={<ChatPage />} />
    </Routes>
  )
}
