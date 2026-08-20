import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import NicknameGate from '../components/NicknameGate'
import RegistrationSuccessModal from '../components/RegistrationSuccessModal'
import { useCampus } from '../hooks/useCampuses'
import { useBuildings } from '../hooks/useBuildings'
import { useCategories } from '../hooks/useCategories'
import { useProfile } from '../hooks/useProfile'
import { createItem, updateItem, useItem, useItems } from '../hooks/useItems'
import { supabase } from '../lib/supabaseClient'
import { trackEvent } from '../lib/analytics'

async function uploadPhoto(file, ownerId) {
  const ext = file.name.split('.').pop()
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('item-photos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
  return data.publicUrl
}

const EMPTY_FORM = {
  postType: 'lend',
  title: '',
  description: '',
  categoryId: '',
  buildingId: '',
  locationText: '',
  availableTime: '',
  photoFile: null,
}

const TIME_PRESETS = {
  lend: ['지금 바로 가능', '오늘 저녁', '내일 오전', '주말에'],
  borrow: ['지금 급해요', '오늘 안에', '내일까지', '이번 주말까지'],
}

export default function ItemFormPage() {
  const { campusSlug, itemId } = useParams()
  const isEdit = Boolean(itemId)
  const [searchParams] = useSearchParams()
  const presetBuildingId = searchParams.get('buildingId') ?? ''
  const presetPostType = searchParams.get('postType') === 'borrow' ? 'borrow' : 'lend'
  const presetTitle = searchParams.get('title') ?? ''
  const navigate = useNavigate()

  const { campus } = useCampus(campusSlug)
  const { buildings } = useBuildings(campus?.id)
  const { categories } = useCategories()
  const { profile, registerNickname } = useProfile()
  const { item: existingItem, loading: loadingExisting } = useItem(itemId)

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    postType: presetPostType,
    buildingId: presetBuildingId,
    title: presetTitle,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdItem, setCreatedItem] = useState(null)

  const { items: buildingItems, loading: loadingBuildingItems } = useItems({
    campusId: campus?.id,
    buildingId: createdItem?.building_id,
  })

  // 수정 모드: 기존 물품 데이터가 로드되면 폼에 채워넣는다
  useEffect(() => {
    if (!existingItem) return
    setForm({
      postType: existingItem.post_type,
      title: existingItem.title,
      description: existingItem.description ?? '',
      categoryId: existingItem.category_id ?? '',
      buildingId: existingItem.building_id ?? '',
      locationText: existingItem.location_text ?? '',
      availableTime: existingItem.available_time ?? '',
      photoFile: null,
    })
  }, [existingItem])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (isEdit) {
        let photoUrl = existingItem.photo_url
        if (form.photoFile) {
          photoUrl = await uploadPhoto(form.photoFile, existingItem.owner_id)
        }
        await updateItem(itemId, {
          building_id: form.buildingId || null,
          category_id: form.categoryId || null,
          post_type: form.postType,
          title: form.title,
          description: form.description || null,
          photo_url: photoUrl,
          location_text: form.locationText || null,
          available_time: form.availableTime || null,
        })
        trackEvent('edit_item', { post_type: form.postType })
        navigate(`/${campusSlug}/items/${itemId}`)
        return
      }

      if (!profile || !campus) return
      let photoUrl = null
      if (form.photoFile) {
        photoUrl = await uploadPhoto(form.photoFile, profile.id)
      }
      const item = await createItem({
        owner_id: profile.id,
        campus_id: campus.id,
        building_id: form.buildingId || null,
        category_id: form.categoryId || null,
        post_type: form.postType,
        title: form.title,
        description: form.description || null,
        photo_url: photoUrl,
        location_text: form.locationText || null,
        available_time: form.availableTime || null,
      })
      const building = buildings.find((b) => b.id === item.building_id)
      setCreatedItem({ ...item, building })
      trackEvent('register_item', { post_type: form.postType, has_building: Boolean(item.building_id) })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isEdit && loadingExisting) {
    return (
      <Layout>
        <p className="text-slate-400">불러오는 중...</p>
      </Layout>
    )
  }

  if (isEdit && !existingItem) {
    return (
      <Layout>
        <p className="text-slate-400">물품을 찾을 수 없어요.</p>
      </Layout>
    )
  }

  if (!isEdit && !profile) {
    return (
      <Layout>
        <h1 className="text-xl font-bold mb-4">물품 등록</h1>
        <NicknameGate
          onSubmit={(nickname, pin) => registerNickname(nickname, pin, campus?.id)}
        />
      </Layout>
    )
  }

  const isBorrow = form.postType === 'borrow'

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? '물품 수정' : isBorrow ? '구하는 글 등록' : '물품 등록'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4">
        <div>
          <label className="text-sm font-medium">글 종류</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update('postType', 'lend')}
              className={`py-2.5 rounded-md text-sm font-medium border ${
                !isBorrow
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              빌려줄게요
            </button>
            <button
              type="button"
              onClick={() => update('postType', 'borrow')}
              className={`py-2.5 rounded-md text-sm font-medium border ${
                isBorrow
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              빌려주세요 (구해요)
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">물건 이름</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder={isBorrow ? '예: 우산 급구합니다' : '예: 보조배터리 (C타입)'}
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
          <label className="text-sm font-medium">{isBorrow ? '필요한 시간대' : '대여 가능 시간'}</label>
          <div className="mt-1.5 mb-1.5 flex flex-wrap gap-1.5">
            {TIME_PRESETS[form.postType].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => update('availableTime', preset)}
                className={`px-2.5 py-1 rounded-full text-xs border ${
                  form.availableTime === preset
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            value={form.availableTime}
            onChange={(e) => update('availableTime', e.target.value)}
            placeholder={isBorrow ? '예: 오늘 저녁까지 급해요' : '예: 평일 저녁 6시~10시'}
            className="w-full border rounded-md px-3 py-2 text-sm"
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
          <label className="text-sm font-medium">
            사진 (선택){isEdit ? ' — 새로 고르지 않으면 기존 사진을 유지해요' : ''}
          </label>
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
          {isEdit ? '수정 완료' : isBorrow ? '구하는 글 등록하기' : '등록하기'}
        </button>
      </form>

      {!isEdit && createdItem && (
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
