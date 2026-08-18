-- 캠퍼스 물품 대여 서비스 MVP - Supabase 스키마
-- MVP 단계에서는 로그인 없이 anon 키로 전체 CRUD를 허용한다.
-- 이후 Supabase Auth를 붙이면 profiles.id를 auth.uid()로 교체하고 정책을 조여야 한다.

create extension if not exists "pgcrypto";

-- 1. 캠퍼스
create table campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  map_image_url text -- 공식 캠퍼스 조감도 이미지 경로 (public/maps/*.png)
);

-- 2. 건물 (지도 이미지 위 클릭 가능한 지점)
create table buildings (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references campuses(id) on delete cascade,
  name text not null,
  code text,
  pos_x numeric not null, -- 지도 이미지 기준 가로 % 좌표 (0~100)
  pos_y numeric not null  -- 지도 이미지 기준 세로 % 좌표 (0~100)
);

-- 3. 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- 4. 사용자 프로필
-- MVP: 로그인 없이 닉네임만 입력받아 클라이언트가 uuid를 생성, localStorage에 저장.
-- 추후 Supabase Auth 도입 시 id를 auth.users(id)와 맞추면 된다.
create table profiles (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  campus_id uuid references campuses(id),
  created_at timestamptz not null default now()
);

-- 5. 물품
-- post_type: 'lend' = 내가 가진 물건을 빌려줌 (중고장터 "팝니다"格), 'borrow' = 물건을 구함 ("삽니다"格)
-- 두 경우 모두 owner_id는 글쓴이, rental_requests.requester_id는 그 글에 반응한 상대방을 의미한다
-- (lend는 "빌려줄게요" 글에 빌리겠다는 사람이 요청하는 것, borrow는 "구해요" 글에 빌려주겠다는 사람이 제안하는 것)
create table items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  campus_id uuid not null references campuses(id),
  building_id uuid references buildings(id),
  category_id uuid not null references categories(id),
  post_type text not null default 'lend'
    check (post_type in ('lend', 'borrow')),
  title text not null,
  description text,
  photo_url text,
  location_text text,
  available_time text,
  status text not null default 'available'
    check (status in ('available', 'rented', 'returned')),
  created_at timestamptz not null default now()
);

-- 6. 대여 요청
create table rental_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  requester_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. 채팅방 (요청 수락 시 자동 생성)
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  rental_request_id uuid unique not null references rental_requests(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 8. 채팅 메시지 (Supabase Realtime 구독 대상)
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 9. 후기
create table reviews (
  id uuid primary key default gen_random_uuid(),
  rental_request_id uuid not null references rental_requests(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index items_campus_idx on items (campus_id);
create index items_building_idx on items (building_id);
create index items_status_idx on items (status);
create index rental_requests_item_idx on rental_requests (item_id);
create index chat_messages_room_idx on chat_messages (chat_room_id);

-- Realtime: 채팅 메시지 테이블 실시간 구독 활성화
alter publication supabase_realtime add table chat_messages;

-- ---------------------------------------------------------------------
-- RLS: MVP 단계에서는 로그인이 없으므로 anon 키에 대해 전체 허용한다.
-- 운영 전환 시 auth.uid() 기반으로 반드시 강화할 것.
-- ---------------------------------------------------------------------
alter table campuses enable row level security;
alter table buildings enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;
alter table items enable row level security;
alter table rental_requests enable row level security;
alter table chat_rooms enable row level security;
alter table chat_messages enable row level security;
alter table reviews enable row level security;

create policy "public read campuses" on campuses for select using (true);
create policy "public read buildings" on buildings for select using (true);
create policy "public read categories" on categories for select using (true);

create policy "public all profiles" on profiles for all using (true) with check (true);
create policy "public all items" on items for all using (true) with check (true);
create policy "public all rental_requests" on rental_requests for all using (true) with check (true);
create policy "public all chat_rooms" on chat_rooms for all using (true) with check (true);
create policy "public all chat_messages" on chat_messages for all using (true) with check (true);
create policy "public all reviews" on reviews for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- Storage: item-photos 버킷 업로드 허용 정책
-- 버킷을 "Public"으로 만들어도 그건 읽기(다운로드)만 열어줄 뿐, 업로드(insert)는
-- storage.objects에 별도 RLS 정책이 있어야 허용된다. MVP는 로그인이 없으므로
-- anon 키에 대해 이 버킷 한정으로 전체 허용한다.
-- ---------------------------------------------------------------------
create policy "public read item-photos" on storage.objects
  for select to public
  using (bucket_id = 'item-photos');

create policy "public upload item-photos" on storage.objects
  for insert to public
  with check (bucket_id = 'item-photos');

-- ---------------------------------------------------------------------
-- 시드 데이터: 성균관대 자연과학캠퍼스(수원) / 인문사회과학캠퍼스(서울 명륜동)
--
-- 두 캠퍼스 모두 사용자가 제공한 공식 캠퍼스 조감도 이미지를 기준으로
-- 건물 라벨의 대략적인 화면상 위치(%)를 눈대중으로 추정해 넣었다.
-- 이미지 파일은 public/maps/natural-campus.jpg, public/maps/insa-campus.jpg
-- 경로에 저장되어 있어야 지도가 표시된다 (README 참고). 좌표는 정밀 측정이
-- 아니므로 화면에서 확인하며 buildings.pos_x/pos_y를 보정할 것.
-- ---------------------------------------------------------------------
insert into categories (name) values
  ('충전기'), ('보조배터리'), ('우산'), ('계산기'), ('기타');

with c1 as (
  insert into campuses (name, slug, map_image_url)
  values ('자연과학캠퍼스', 'natural', '/maps/natural-campus.jpg')
  returning id
),
c2 as (
  insert into campuses (name, slug, map_image_url)
  values ('인문사회과학캠퍼스', 'humanities', '/maps/insa-campus.jpg')
  returning id
)
insert into buildings (campus_id, name, code, pos_x, pos_y)
select id, name, code, pos_x, pos_y from (
  select (select id from c1) as id, v.name, v.code, v.pos_x, v.pos_y
  from (values
    ('지관', null, 57, 6),
    ('인관', null, 23, 16),
    ('의관', null, 29, 16),
    ('예관', null, 36, 15),
    ('제2공학관', '25,26,27', 51, 14),
    ('생명공학실습동', '63,64', 74, 14),
    ('기숙사 신관', null, 6, 23),
    ('생명공학관2', '62', 39, 22),
    ('제2동종합연구동', '83', 83, 25),
    ('생명공학관1', '61', 16, 33),
    ('제2과학관', '32', 43, 32),
    ('공학실습동', '20,24', 71, 32),
    ('제1동종합연구동', '81', 84, 34),
    ('기초학문관', '51', 23, 39),
    ('제1과학관', '31', 32, 39),
    ('제1공학관', '21,22,23', 55, 39),
    ('약학관', '53', 74, 39),
    ('반도체관', '40', 90, 39),
    ('복지회관', null, 21, 46),
    ('삼성학술정보관', null, 39, 46),
    ('화학관', '33', 88, 48),
    ('N센터', null, 68, 49),
    ('제약기술관', '84', 78, 52),
    ('학생회관', null, 44, 52),
    ('수성관(체육관)', null, 18, 59),
    ('의학관', '71', 46, 59)
  ) as v(name, code, pos_x, pos_y)
  union all
  select (select id from c2) as id, v.name, v.code, v.pos_x, v.pos_y
  from (values
    ('퇴계인문관', '31', 9, 17),
    ('다산경제관', '32', 29, 10),
    ('수선관 별관', '62', 7, 27),
    ('교수회관', null, 44, 20),
    ('중앙학술정보관', null, 61, 18),
    ('수선관', '61', 7, 38),
    ('호암관', '50', 27, 38),
    ('경영관', '33', 43, 33),
    ('600주년기념관', null, 65, 33),
    ('법학관', '2', 9, 62),
    ('학생회관', null, 43, 62),
    ('국제관', '9', 68, 62)
  ) as v(name, code, pos_x, pos_y)
) t;
