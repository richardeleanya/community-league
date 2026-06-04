CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code text;
BEGIN
  LOOP
    generated_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.users
      WHERE referral_code = generated_code
    );
  END LOOP;

  RETURN generated_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    email_verified,
    password_hash,
    account_status,
    referral_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.encrypted_password,
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::account_status_enum
      ELSE 'pending_verification'::account_status_enum
    END,
    public.generate_referral_code(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    password_hash = EXCLUDED.password_hash,
    account_status = EXCLUDED.account_status,
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    password_hash = COALESCE(NEW.encrypted_password, password_hash),
    account_status = CASE
      WHEN account_status = 'pending_verification'::account_status_enum
        AND NEW.email_confirmed_at IS NOT NULL
      THEN 'active'::account_status_enum
      ELSE account_status
    END,
    updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_created();

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email, email_confirmed_at, encrypted_password ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_updated();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_clubs_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_supporter_profiles_updated_at
BEFORE UPDATE ON supporter_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_fixtures_updated_at
BEFORE UPDATE ON fixtures
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_community_actions_updated_at
BEFORE UPDATE ON community_actions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_league_tables_updated_at
BEFORE UPDATE ON league_tables
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_individual_rankings_updated_at
BEFORE UPDATE ON individual_rankings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_legacy_projects_updated_at
BEFORE UPDATE ON legacy_projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_legacy_map_pins_updated_at
BEFORE UPDATE ON legacy_map_pins
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_club_news_updated_at
BEFORE UPDATE ON club_news
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_platform_settings_updated_at
BEFORE UPDATE ON platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
