CREATE TABLE IF NOT EXISTS public.menu_admins (
  user_id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.today_menu (
  id integer PRIMARY KEY CHECK (id = 1),
  fish_name text NOT NULL CHECK (char_length(trim(fish_name)) BETWEEN 1 AND 60),
  service_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'sold_out')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL REFERENCES public.menu_admins(user_id)
);
REVOKE ALL ON public.menu_admins, public.today_menu FROM PUBLIC;
