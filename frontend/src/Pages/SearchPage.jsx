import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { movieService } from '../services/api';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    // A função de busca agora é assíncrona para esperar pela API
    const fetchResults = async (searchQuery) => {
      if (!searchQuery) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const apiResults = await movieService.searchMovies(searchQuery);
        setResults(apiResults);
      } catch (err) {
        console.error('Erro na busca:', err);
        setError('Não foi possível realizar a busca. Tente novamente.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults(query);
    } else {
      setResults([]);
    }
  }, [query]);

  // Função para renderizar o conteúdo da página com base nos estados
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D3748] mb-4">Buscar Filmes</h1>
          <p className="text-[#A0AEC0] mb-6">Encontre qualquer filme no catálogo</p>
          <SearchBar
            onSearch={async (searchQuery) => {
              if (searchQuery) {
                window.history.replaceState(null, '', `?query=${encodeURIComponent(searchQuery)}`);
              }
            }}
            placeholder="Digite o nome do filme..."
            className="max-w-2xl mx-auto"
          />
        </div>

        {loading ? (
          <div className="py-20"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-red-500">{error}</h2>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={{
                  ...movie,
                  poster_url: movie.poster_url || movie.image,
                  vote_average: movie.vote_average || 0,
                  release_date: movie.release_date || new Date().toISOString()
                }}
                onWishlistToggle={(movieId) => {
                  console.log('Add to wishlist:', movieId);
                }}
                isInWishlist={false}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{query}"</h2>
            <p className="text-[#A0AEC0] mt-2">Tente uma busca diferente.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
