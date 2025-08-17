CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS lists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  source text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  title text not null,
  description text,
  meta jsonb,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  list_id uuid references lists(id) on delete cascade,
  item_id uuid references list_items(id) on delete cascade,
  weight int not null,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete cascade,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS category_lists (
  category_id uuid references categories(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  primary key (category_id, list_id)
);

CREATE TABLE IF NOT EXISTS search_logs (
  id bigserial primary key,
  query text,
  count int default 1,
  updated_at timestamptz default now()
);

CREATE OR REPLACE FUNCTION aggregate_scores(p_list_id uuid)
RETURNS TABLE(item_id uuid, total int) AS $$
  SELECT item_id, COALESCE(SUM(weight),0) as total FROM votes WHERE list_id = p_list_id GROUP BY item_id;
$$ LANGUAGE SQL STABLE;

CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

CREATE OR REPLACE FUNCTION trending_lists(p_since timestamptz)
RETURNS TABLE(id uuid, title text, vote_sum int) AS $$
  SELECT l.id, l.title, COALESCE(SUM(v.weight),0)::int
  FROM lists l
  LEFT JOIN votes v ON v.list_id = l.id AND v.created_at >= p_since
  GROUP BY l.id
  ORDER BY SUM(v.weight) DESC NULLS LAST
  LIMIT 10;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION increment_search(p_query text)
RETURNS void AS $$
BEGIN
  UPDATE search_logs SET count = count + 1, updated_at = now() WHERE query = p_query;
  IF NOT FOUND THEN
    INSERT INTO search_logs(query, count) VALUES (p_query, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- v0.3 additions: favorites & threaded comments
CREATE TABLE IF NOT EXISTS favorites (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  list_id uuid references lists(id) on delete cascade,
  created_at timestamptz default now(),
  UNIQUE (user_id, list_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  list_id uuid references lists(id) on delete cascade,
  item_id uuid references list_items(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_comments_list ON comments(list_id);
CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_id);
