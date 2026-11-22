alter table public.profiles
  drop constraint if exists profiles_username_reserved;

alter table public.profiles
  add constraint profiles_username_reserved
  check (
    username is null
    or username !~ '^(admin|administrator|street_souk|support|staff|official|moderator|help)$'
  );
