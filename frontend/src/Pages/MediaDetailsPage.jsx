// src/pages/MediaDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BsStarFill, BsStar, BsBookmarkPlus } from 'react-icons/bs';

// Componente para avaliação interativa do usuário
const InteractiveStarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex text-2xl">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={index}
            className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-[#FF8C42]' : 'text-gray-300'}`}
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

// Componente para exibir a avaliação (estático)
const StarRating = ({ rating }) => (
  <div className="flex text-[#FF8C42]">
    {[...Array(5)].map((_, i) => (
      i < rating ? 
        <BsStarFill key={i} className="h-5 w-5" /> : 
        <BsStar key={i} className="h-5 w-5 text-gray-300" />
    ))}
  </div>
);

// Componente para exibir um card de review
const ReviewCard = ({ review }) => {
    const getAvatarUrl = (name) => {
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `https://i.pravatar.cc/150?u=${seed}`;
    };

    const userName = review.usuario_nome || review.user || 'Anônimo';
    const userRating = review.nota || review.rating || 0;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center mb-2">
                <img 
                    src={getAvatarUrl(userName)} 
                    alt={userName} 
                    className="w-10 h-10 rounded-full mr-3" 
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
            <p className="text-[#A0AEC0] text-sm leading-relaxed">
                {review.comentario || review.text}
            </p>
            {review.spoiler && (
                <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full inline-block">
                    ⚠️ Contém spoilers
                </div>
            )}
        </div>
    );
};


const MediaDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0); // Estado para a nota do usuário

  useEffect(() => {
    if (id) {
      loadMovieData(parseInt(id));
    }
  }, [id]);

  const loadMovieData = async (movieId) => {
    try {
      setLoading(true);
      setError(null);
      const movieData = await movieService.getMovieDetails(movieId);
      setMovie(movieData);
    } catch (error) {
      console.error('Erro ao carregar filme:', error);
      setError('Erro ao carregar dados do filme.');
    } finally {
      setLoading(false);
    }
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
        <div className="text-red-500 text-lg">{error || 'Filme não encontrado'}</div>
      </div>
    );
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const ourRating = movie.vote_average ? Math.round(movie.vote_average / 2) : 0;
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        {/* HERO SECTION */}
        <div 
          className="relative h-96 bg-cover bg-center rounded-2xl overflow-hidden mb-8 shadow-xl"
          style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%), url(${backdropUrl})` }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-colors flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>

          <div className="absolute bottom-0 left-0 p-8 text-white flex items-end w-full">
            <img 
              src={movie.poster_url} 
              alt={movie.title} 
              className="w-40 h-auto object-cover rounded-lg shadow-lg mr-6 hidden md:block"
            />
            <div className='flex-1'>
              <h1 className="text-4xl md:text-5xl font-extrabold text-shadow">{movie.title}</h1>
              <p className="text-lg md:text-xl mt-2 text-shadow">{movie.original_title} ({releaseYear})</p>
              <div className="flex items-center mt-3 text-lg">
                <StarRating rating={ourRating} />
                <span className="ml-3 text-gray-300">{movie.vote_average?.toFixed(1)} / 10</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {movie.genres && movie.genres.map((genre) => (
                  <span key={genre.id || genre} className="bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full">
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
          <button className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm transition-colors flex items-center gap-2 px-3 py-2 rounded-full font-semibold cursor-pointer z-10">
            <BsBookmarkPlus />
            Adicionar à Lista
          </button>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Sinopse</h2>
            <p className="text-[#A0AEC0] leading-relaxed mb-8">{movie.overview || "Sinopse não disponível."}</p>
            
            {movie.director && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#2D3748] mb-3">Direção</h3>
                <p className="text-gray-600">{movie.director}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Deixe sua Avaliação</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] transition"
                  rows="4"
                  placeholder="Escreva sua opinião aqui..."
                ></textarea>
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2D3748] mb-1">Sua nota:</p>
                    <InteractiveStarRating rating={userRating} onRatingChange={setUserRating} />
                  </div>
                  <button 
                    className="bg-[#FF8C42] text-white font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>

            {movie.reviews && movie.reviews.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Avaliações da Comunidade</h2>
                <div className="space-y-4">
                  {movie.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* SIDEBAR */}
          <div>
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Elenco Principal</h2>
            <div className="space-y-4">
              {movie.cast && movie.cast.slice(0, 8).map((actor) => (
                <div key={actor.id} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/80x120?text=No+Image'} alt={actor.name} className="w-12 h-16 rounded-md mr-4 object-cover" />
                  <div>
                    <p className="font-semibold text-[#2D3748]">{actor.name}</p>
                    <p className="text-sm text-[#A0AEC0]">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailsPage;