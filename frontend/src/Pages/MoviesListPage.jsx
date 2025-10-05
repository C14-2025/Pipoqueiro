import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MoviesListPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('popular'); // 'popular' ou 'ranking'

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        
        if (viewType === 'ranking') {
          try {
            response = await movieService.getRanking(1); // Mínimo de 1 review
          } catch (rankingError) {
            // Se o ranking falhar (sem reviews), retorna lista vazia
            response = [];
          }
        } else {
          response = await movieService.getPopular();
        }
        
        // A API retorna os filmes diretamente no array response
        const transformedMovies = response?.map((movie, index) => ({
          id: movie.id,
          rank: movie.rank || index + 1,
          title: movie.title,
          year: new Date(movie.release_date).getFullYear(),
          duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A',
          rating: movie.nossa_stats?.nota_media || movie.vote_average || 0,
          popularity: movie.popularity,
          poster: movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder-movie.jpg'),
          reviewCount: movie.nossa_stats?.total_avaliacoes || 0
        })) || [];
        
        setMovies(transformedMovies);
      } catch (err) {
        console.error('Erro ao buscar filmes:', err);
        if (viewType === 'popular') {
          setError('Erro ao carregar a lista de filmes. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [viewType]);

  // Criar variável para verificar se deve mostrar mensagem de ranking vazio
  const isRankingEmpty = viewType === 'ranking' && movies.length === 0 && !loading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-[#A0AEC0] text-lg mt-4">Carregando filmes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-[#00B5AD] text-white px-6 py-2 rounded-lg hover:bg-[#008B85] transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        <div className="border-l-4 border-[#FF8C42] pl-4 mb-8">
          <h1 className="text-5xl font-bold text-[#2D3748]">
            {viewType === 'ranking' ? 'Ranking da Comunidade' : 'Filmes Populares'}
          </h1>
          <p className="text-[#A0AEC0] mt-1">
            {viewType === 'ranking' 
              ? 'Os filmes mais bem avaliados pela comunidade Pipoqueiro.'
              : 'Os filmes mais populares do momento.'
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#A0AEC0] font-semibold">Visualizar:</span>
              <button 
                onClick={() => setViewType('popular')}
                className={`font-semibold transition-colors cursor-pointer px-3 py-1 rounded-md ${
                  viewType === 'popular' 
                    ? 'text-white bg-[#00B5AD]' 
                    : 'text-[#2D3748] hover:text-[#00B5AD] hover:bg-gray-100'
                }`}
              >
                Populares
              </button>
              <button 
                onClick={() => setViewType('ranking')}
                className={`font-semibold transition-colors cursor-pointer px-3 py-1 rounded-md ${
                  viewType === 'ranking' 
                    ? 'text-white bg-[#00B5AD]' 
                    : 'text-[#2D3748] hover:text-[#00B5AD] hover:bg-gray-100'
                }`}
              >
                Ranking
              </button>
            </div>
            {isRankingEmpty && (
              <span className="text-sm text-[#A0AEC0] italic">
                Nenhum filme avaliado pela comunidade ainda
              </span>
            )}
          </div>

          <div className="space-y-4">
            {isRankingEmpty ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                  Nenhum filme avaliado ainda
                </h3>
                <p className="text-[#A0AEC0] mb-4">
                  Seja o primeiro a avaliar filmes e criar o ranking da comunidade!
                </p>
                <button 
                  onClick={() => setViewType('popular')} 
                  className="bg-[#00B5AD] text-white px-6 py-2 rounded-lg hover:bg-[#008B85] transition-colors"
                >
                  Ver Filmes Populares
                </button>
              </div>
            ) : (
              movies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                  <img src={movie.poster} alt={movie.title} className="w-16 h-auto rounded-md" />
                  <div className="flex-grow">
                    <Link to={`/filme/${movie.id}`} className="hover:underline">
                      <h2 className="text-xl font-bold text-[#2D3748]">{movie.rank}. {movie.title}</h2>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-[#A0AEC0] mt-1">
                      <span>{movie.year}</span>
                      <span>{movie.duration}</span>
                      {viewType === 'ranking' && movie.reviewCount > 0 && (
                        <span className="text-[#00B5AD] font-medium">
                          {movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span className="text-yellow-500">&#9733;</span>
                    <span>{parseFloat(movie.rating).toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MoviesListPage;