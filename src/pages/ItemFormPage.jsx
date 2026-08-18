import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import NicknameGate from '../components/NicknameGate'
import RegistrationSuccessModal from '../components/RegistrationSuccessModal'
import { useCampus } from '../hooks/useCampuses'
import { useBuildings } from '../hooks/useBuildings'
import { useCategories } from '../hooks/useCategories'
import { useProfile } from '../hooks/useProfile'
import { createItem, useItems } from '../hooks/useItems'
import { supabase } from '../lib/supabaseClient'

async function uploadPhoto(file, ownerId) {
  const ext = file.name.split('.').pop()
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('item-photos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
  return data.publicUrl
}

export default function ItemFormPage() {
  const { campusSlug } = useParams()
  const [searchParams] = useSearchParams()
  const presetBuildingId = searchParams.get('buildingId') ?? ''
  const navigate = useNavigate()

  const { campus } = useCampus(campusSlug)
  const { buildings } = useBuildings(campus?.id)
  const { categories } = useCategories()
  const { profile, registerNickname } = useProfile()

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    buildingId: presetBuildingId,
    locationText: '',
    availableTime: '',
    photoFile: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdItem, setCreatedItem] = useState(null)

  const { items: buildingItems, loading: loadingBuildingItems } = useItems({
    campusId: campus?.id,
    buildingId: createdItem?.building_id,
  })

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile || !campus) return
    setSubmitting(true)
    setError(null)
    try {
      let photoUrl = null
      if (form.photoFile) {
        photoUrl = await uploadPhoto(form.photoFile, profile.id)
      }
      const item = await createItem({
        owner_id: profile.id,
        campus_id: campus.id,
        building_id: form.buildingId || null,
        category_id: form.categoryId || null,
        title: form.title,
        description: form.description || null,
        photo_url: photoUrl,
        location_text: form.locationText || null,
        available_time: form.availableTime || null,
      })
      const building = buildings.find((b) => b.id === item.building_id)
      setCreatedItem({ ...item, building })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!profile) {
    return (
      <Layout>
        <h1 className="text-xl font-bold mb-4">물품 등록</h1>
        <NicknameGate onSubmit={(nickname) => registerNickname(nickname, campus?.id)} />
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">물품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4">
        <div>
          <label className="text-sm font-medium">물건 이름</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="예: 보조배터리 (C타입)"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">카테고리</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>
              선택
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">건물 (지도에서 선택)</label>
          <select
            value={form.buildingId}
            onChange={(e) => update('buildingId', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="">선택 안 함</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">세부 위치 (선택)</label>
          <input
            value={form.locationText}
            onChange={(e) => update('locationText', e.target.value)}
            placeholder="예: 3층 열람실 앞"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">대여 가능 시간</label>
          <input
            value={form.availableTime}
            onChange={(e) => update('availableTime', e.target.value)}
            placeholder="예: 평일 저녁 6시~10시"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">설명 (선택)</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-20 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">사진 (선택)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => update('photoFile', e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-brand-600 text-white font-medium disabled:opacity-50"
        >
          등록하기
        </button>
      </form>

      {createdItem && (
        <RegistrationSuccessModal
          item={createdItem}
          buildingItems={buildingItems}
          loadingBuildingItems={loadingBuildingItems}
          onViewDetail={() => navigate(`/${campusSlug}/items/${createdItem.id}`)}
          onViewMap={() => navigate(`/${campusSlug}/map?building=${createdItem.building_id}`)}
        />
      )}
    </Layout>
  )
}
