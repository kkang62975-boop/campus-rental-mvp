import { Route, Routes } from 'react-router-dom'
import CampusSelectPage from './pages/CampusSelectPage'
import MapPage from './pages/MapPage'
import ItemListPage from './pages/ItemListPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import ChatPage from './pages/ChatPage'
import MyPage from './pages/MyPage'

export default function App() {
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
