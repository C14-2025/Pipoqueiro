import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieService, reviewService, authService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieCard from '../components/MovieCard';
import { BsStarFill, BsStar, BsBookmarkPlus, BsHeart, BsHeartFill, BsBookmarkFill, BsPlayFill } from 'react-icons/bs';
import { useUserLists } from '../context/UserListsContext';
import { toast } from 'react-toastify';

const InteractiveStarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex text-2xl">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={index}
            className={`cursor-pointer transition-colors duration-200 ${
              ratingValue <= (hover || rating) ? 'text-[#FF8C42]' : 'text-gray-300'
            }`}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex text-[#FF8C42]">
    {[...Array(5)].map((_, i) =>
      i < Math.round(rating) ? (
        <BsStarFill key={i} className="h-5 w-5" />
      ) : (
        <BsStar key={i} className="h-5 w-5 text-gray-300" />
      )
    )}
  </div>
);

const ReviewCard = ({ review }) => {
  const [showSpoiler, setShowSpoiler] = useState(!review.spoiler);

  const getAvatarUrl = (name) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://i.pravatar.cc/150?u=${seed}`;
  };

  const userName = review.usuarios?.nome || review.usuario_nome || review.nome || 'Anônimo';
  const userRating = review.nota || review.rating || 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <div className="flex items-center mb-2">
        <img
          src={review.usuarios?.foto_perfil || review.foto_perfil || getAvatarUrl(userName)}
          alt={userName}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div className="flex-1">
          <h4 className="font-bold text-[#2D3748]">{userName}</h4>
          <StarRating rating={userRating} />
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#00B5AD]">
            {userRating}/5
          </div>
        </div>
      </div>
      {review.titulo_review && (
        <h5 className="font-bold text-[#2D3748] mt-3 mb-1">{review.titulo_review}</h5>
      )}
      
      <div className="relative">
        <p 
          className={`text-[#A0AEC0] text-sm leading-relaxed transition-all duration-300 ${
            showSpoiler ? 'filter-none' : 'filter blur-md'
          }`}
        >
          {review.comentario || review.text}
        </p>

        {review.spoiler && !showSpoiler && (
          <div 
            className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer"
            onClick={() => setShowSpoiler(true)}
          >
            <button className="bg-[#FF8C42] text-white font-bold py-2 px-4 rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Mostrar Spoiler
            </button>
          </div>
        )}
      </div>

      {review.spoiler ? (
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full inline-block">
          ⚠️ Contém spoilers
          {showSpoiler && (
            <button 
              onClick={() => setShowSpoiler(false)} 
              className="ml-2 text-yellow-800 hover:text-yellow-900 font-semibold cursor-pointer"
            >
              (Esconder)
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

const MediaDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSpoiler, setReviewSpoiler] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState(null);

  const [videos, setVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [credits, setCredits] = useState(null);
  const [showAllCast, setShowAllCast] = useState(false);

  const {
    isMovieInWatchlist,
    toggleWatchlist,
    isMovieInFavorites,
    toggleFavorites,
    isLoggedIn,
  } = useUserLists();

  const isInWatchlist = movie ? isMovieInWatchlist(movie.id) : false;
  const isInFavorites = movie ? isMovieInFavorites(movie.id) : false;

  useEffect(() => {
    if (authService.isAuthenticated()) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setUser(currentUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (id) {
      loadMovieData(parseInt(id));
    }
  }, [id]);

  const loadMovieData = async (movieId) => {
    try {
      setLoading(true);
      setError(null);

      const [movieData, reviewsData, videosData, similarsData, creditsData] =
        await Promise.all([
          movieService.getMovieDetails(movieId),
          reviewService.getMovieReviews(movieId, true).catch(() => []),
          movieService.getMovieVideos(movieId).catch(() => []),
          movieService.getSimilarMovies(movieId).catch(() => []),
          movieService.getMovieCredits(movieId).catch(() => null),
        ]);
      
      let pipoqueiroRating = null;
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((acc, review) => acc + (review.nota || review.rating || 0), 0);
        pipoqueiroRating = totalRating / reviewsData.length;
      }

      setMovie({
        ...movieData,
        reviews: reviewsData || [],
        pipoqueiro_rating: pipoqueiroRating,
      });

      setVideos(videosData || []);
      setSimilarMovies((similarsData || []).slice(0, 5));
      setCredits(creditsData);
    } catch (error) {
      console.error('Erro ao carregar filme:', error);
      setError('Erro ao carregar dados do filme.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!userRating || !reviewText.trim()) {
      toast.warn('Por favor, adicione uma nota e um comentário.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        tmdb_id: parseInt(id),
        nota: userRating,
        comentario: reviewText.trim(),
        spoiler: reviewSpoiler,
      });

      await loadMovieData(parseInt(id));

      setUserRating(0);
      setReviewText('');
      setReviewSpoiler(false);

      toast.success('Review publicada com sucesso!');
    } catch (error) {
      console.error('Erro ao submeter review:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Erro ao publicar review. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWatchlist = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login?message=favorite');
      return;
    }
    toggleWatchlist(movie.id);
  };

  const handleToggleFavorites = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login?message=favorite');
      return;
    }
    toggleFavorites(movie.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center py-20">
        <div className="text-red-500 text-lg">
          {error || 'Filme não encontrado'}
        </div>
      </div>
    );
  }

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';
  const tmdbRating = movie.vote_average
    ? movie.vote_average / 2
    : 0;
  const pipoqueiroRating = movie.pipoqueiro_rating;
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '';

  const trailer =
    videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
    videos[0];

  const hasUserReviewed = movie.reviews.some(
    (review) => review.usuario_id === user?.id
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        <div
          className="relative h-96 bg-cover bg-center rounded-2xl overflow-hidden mb-8 shadow-xl"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%), url(${backdropUrl})`,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-colors flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Voltar
          </button>

          <div className="absolute bottom-0 left-0 p-8 text-white flex items-end w-full">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-40 h-auto object-cover rounded-lg shadow-lg mr-6 hidden md:block"
            />
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-shadow">
                {movie.title}
              </h1>
              <p className="text-lg md:text-xl mt-2 text-shadow">
                {movie.original_title} ({releaseYear})
              </p>
              
              <div className="mt-3 flex flex-col gap-1 text-lg">
                <div className="flex items-center">
                  <StarRating rating={tmdbRating} />
                  <span className="ml-3 text-gray-300 text-sm">
                    {movie.vote_average?.toFixed(1)} / 10 (TMDb)
                  </span>
                </div>
                
                {pipoqueiroRating !== null && (
                  <div className="flex items-center">
                    <StarRating rating={pipoqueiroRating} />
                    <span className="ml-3 text-gray-300 text-sm">
                      {pipoqueiroRating.toFixed(1)} / 5 (Pipoqueiro)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {movie.genres &&
                  movie.genres.map((genre) => (
                    <span
                      key={genre.id || genre}
                      className="bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {genre.name || genre}
                    </span>
                  ))}
                {movie.runtime && (
                  <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {movie.runtime} min
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <button
              onClick={handleToggleWatchlist}
              className={`text-white hover:opacity-80 backdrop-blur-sm transition-all duration-300 transform font-semibold cursor-pointer z-10 px-4 py-2 rounded-full flex items-center gap-2
                ${
                  isInWatchlist
                    ? 'bg-[#00B5AD] scale-105'
                    : 'bg-white/20 hover:bg-[#00B5AD]/50'
                }`}
            >
              {isInWatchlist ? <BsBookmarkFill /> : <BsBookmarkPlus />}
              {isInWatchlist ? 'Na Sua Lista' : 'Adicionar à Lista'}
            </button>

            <button
              onClick={handleToggleFavorites}
              className={`text-white hover:opacity-80 backdrop-blur-sm transition-all duration-300 transform font-semibold cursor-pointer z-10 px-4 py-2 rounded-full flex items-center gap-2
                ${
                  isInFavorites
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                    : 'bg-white/20 hover:bg-red-500/50 hover:scale-105'
                }`}
            >
              {isInFavorites ? <BsHeartFill /> : <BsHeart />}
              {isInFavorites ? 'Curtiu!' : 'Curtir'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Sinopse</h2>
            <p className="text-[#A0AEC0] leading-relaxed mb-8">
              {movie.overview || 'Sinopse não disponível.'}
            </p>

            {movie.director && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#2D3748] mb-3">
                  Direção
                </h3>
                <p className="text-gray-600">{movie.director}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#2D3748] mb-4">
                Deixe sua Avaliação
              </h2>
              {(() => {
                if (authService.isAuthenticated()) {
                  if (hasUserReviewed) {
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <p className="text-lg font-semibold text-[#00B5AD]">
                          ✓ Você já avaliou este filme.
                        </p>
                        <p className="text-[#A0AEC0] mt-2">
                          Sua avaliação está visível na seção "Avaliações da Comunidade" abaixo.
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] transition"
                          rows="4"
                          placeholder="Escreva sua opinião aqui..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          disabled={submittingReview}
                        />
                        <div className="flex items-center mt-3">
                          <input
                            type="checkbox"
                            id="spoiler-check"
                            checked={reviewSpoiler}
                            onChange={(e) => setReviewSpoiler(e.target.checked)}
                            disabled={submittingReview}
                            className="h-4 w-4 text-[#FF8C42] border-gray-300 rounded focus:ring-[#FF8C42] disabled:opacity-50"
                          />
                          <label htmlFor="spoiler-check" className="ml-2 text-sm font-medium text-yellow-700 cursor-pointer">
                            ⚠️ Marcar como spoiler
                          </label>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <p className="text-sm font-semibold text-[#2D3748] mb-1">
                              Sua nota:
                            </p>
                            <InteractiveStarRating
                              rating={userRating}
                              onRatingChange={setUserRating}
                            />
                          </div>
                          <button
                            onClick={handleSubmitReview}
                            disabled={
                              submittingReview || !userRating || !reviewText.trim()
                            }
                            className="bg-[#FF8C42] text-white font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingReview ? 'Publicando...' : 'Publicar'}
                          </button>
                        </div>
                      </div>
                    );
                  }
                } else {
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-[#A0AEC0] mb-4">
                        Faça login para deixar sua avaliação
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-[#00B5AD] text-white font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        Fazer Login
                      </button>
                    </div>
                  );
                }
              })()}
            </div>

            {movie.reviews && movie.reviews.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-[#2D3748] mb-4">
                  Avaliações da Comunidade
                </h2>
                <div className="space-y-4">
                  {movie.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">
              Elenco Principal
            </h2>
            <div className="space-y-4">
              {credits &&
                credits.cast &&
                credits.cast
                  .slice(0, showAllCast ? credits.cast.length : 5)
                  .map((actor) => (
                    <div
                      key={actor.id}
                      className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : 'https://via.placeholder.com/80x120?text=No+Image'
                        }
                        alt={actor.name}
                        className="w-12 h-16 rounded-md mr-4 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[#2D3748]">
                          {actor.name}
                        </p>
                        <p className="text-sm text-[#A0AEC0]">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
              {credits && credits.cast && credits.cast.length > 5 && (
                <button
                  onClick={() => setShowAllCast(!showAllCast)}
                  className="w-full bg-[#00B5AD] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#009A92] transition-colors"
                >
                  {showAllCast
                    ? 'Ver Menos'
                    : `Ver Mais (${credits.cast.length - 5})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {trailer && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Trailer</h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {similarMovies && similarMovies.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-6">
              Filmes Similares
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {similarMovies.map((similarMovie) => (
                <MovieCard
                  key={similarMovie.id}
                  movie={{
                    ...similarMovie,
                    poster_url: similarMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${similarMovie.poster_path}`
                      : 'https://via.placeholder.com/300x450?text=No+Image',
                    vote_average: similarMovie.vote_average || 0,
                    release_date:
                      similarMovie.release_date || new Date().toISOString(),
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailsPage;