CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INT)
RETURNS json AS $$
DECLARE
  review_stats json;
  watchlist_stats json;
  favorites_stats json;
BEGIN
  SELECT
    json_build_object(
      'total_reviews', COUNT(*),
      'nota_media', AVG(nota),
      'reviews_positivas', COUNT(CASE WHEN nota >= 4 THEN 1 END)
    )
  INTO review_stats
  FROM avaliacoes WHERE usuario_id = p_user_id;

  SELECT
    json_build_object(
      'filmes_na_lista', json_array_length(lista_quero_ver)
    ),
    json_build_object(
      'total_favoritos', json_array_length(favoritos)
    )
  INTO watchlist_stats, favorites_stats
  FROM usuarios WHERE id = p_user_id;

  RETURN json_build_object(
    'reviews', review_stats,
    'watchlist', watchlist_stats,
    'favorites', favorites_stats
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_to_watchlist(p_user_id INT, p_tmdb_id INT)
RETURNS JSON AS $$
DECLARE
  new_watchlist JSON;
BEGIN
  UPDATE usuarios
  SET lista_quero_ver = (
    SELECT json_agg(DISTINCT film_id)
    FROM (
      SELECT (value::text)::int AS film_id
      FROM json_array_elements(lista_quero_ver)
      
      UNION ALL
      
      SELECT p_tmdb_id AS film_id
    ) AS all_ids
  )
  WHERE id = p_user_id
  RETURNING lista_quero_ver INTO new_watchlist;
  
  RETURN new_watchlist;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_to_favorites(p_user_id INT, p_tmdb_id INT)
RETURNS JSON AS $$
DECLARE
  new_favorites JSON;
BEGIN
  UPDATE usuarios
  SET favoritos = (
    SELECT json_agg(DISTINCT film_id)
    FROM (
      SELECT (value::text)::int AS film_id
      FROM json_array_elements(favoritos)
      
      UNION ALL
      SELECT p_tmdb_id AS film_id
    ) AS all_ids
  )
  WHERE id = p_user_id
  RETURNING favoritos INTO new_favorites;
  
  RETURN new_favorites;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_from_watchlist(p_user_id INT, p_tmdb_id INT)
RETURNS JSON AS $$
DECLARE
  new_watchlist JSON;
BEGIN
  UPDATE usuarios
  SET lista_quero_ver = (
    SELECT COALESCE(json_agg(value), '[]'::json)
    FROM json_array_elements(lista_quero_ver)
    WHERE (value::text)::int != p_tmdb_id
  )
  WHERE id = p_user_id
  RETURNING lista_quero_ver INTO new_watchlist;
  
  RETURN new_watchlist;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_from_favorites(p_user_id INT, p_tmdb_id INT)
RETURNS JSON AS $$
DECLARE
  new_favorites JSON;
BEGIN
  UPDATE usuarios
  SET favoritos = (
    SELECT COALESCE(json_agg(value), '[]'::json)
    FROM json_array_elements(favoritos)
    WHERE (value::text)::int != p_tmdb_id
  )
  WHERE id = p_user_id
  RETURNING favoritos INTO new_favorites;
  
  RETURN new_favorites;
END;
$$ LANGUAGE plpgsql;