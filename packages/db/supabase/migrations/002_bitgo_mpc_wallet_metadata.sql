-- Add BitGo MPC wallet metadata columns to wallets and allow metadata-only records.
-- Keeps existing stealth-wallet fields for backward compatibility.

do $$
begin
  if to_regclass('public.wallets') is null then
    raise exception 'Missing table public.wallets. Apply 001_initial.sql before 002_bitgo_mpc_wallet_metadata.sql.';
  end if;
end;
$$;

alter table public.wallets
  alter column encrypted_view_priv_key drop not null,
  alter column encrypted_spend_priv_key drop not null,
  alter column public_view_key drop not null,
  alter column public_spend_key drop not null;

alter table public.wallets
  add column if not exists wallet_id text,
  add column if not exists coin text,
  add column if not exists wallet_label text,
  add column if not exists multisig_type text,
  add column if not exists wallet_type text,
  add column if not exists receive_address text;

update public.wallets
set
  wallet_id = coalesce(wallet_id, bitgo_wallet_id),
  coin = coalesce(coin, network),
  wallet_label = coalesce(wallet_label, label)
where wallet_id is null
   or coin is null
   or wallet_label is null;

alter table public.wallets
  alter column wallet_id set not null,
  alter column coin set not null,
  alter column wallet_label set not null;

create unique index if not exists wallets_wallet_id_key on public.wallets(wallet_id);
create index if not exists wallets_user_id_wallet_id_idx on public.wallets(user_id, wallet_id);
