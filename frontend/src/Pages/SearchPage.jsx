import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { movieService } from '../services/api'; // Importa o serviço de API

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    // A função de busca agora é assíncrona para esperar pela API
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Usa a função searchMovies do serviço de API
        const apiResults = await movieService.searchMovies(query);

        // Adapta os dados da API para o formato que o seu design espera
        const adaptedResults = apiResults.map(movie => ({
          id: movie.id,
          title: movie.title,
          image: movie.poster_url, // Mapeia poster_url para image
          type: 'Filme' // Adiciona o tipo, já que a API não o fornece
        }));

        setResults(adaptedResults);
      } catch (err) {
        console.error('Erro na busca:', err);
        setError('Não foi possível realizar a busca. Tente novamente.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Este efeito é executado sempre que o 'query' na URL muda

  // Função para renderizar o conteúdo da página com base nos estados
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00B5AD]"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500">{error}</h2>
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map(item => (
            <Link to={`/${item.type.toLowerCase()}/${item.id}`} key={item.id} className="relative rounded-lg overflow-hidden group shadow-lg aspect-[2/3]">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3 text-white">
                <span className="text-xs bg-[#FF8C42] px-2 py-1 rounded">{item.type}</span>
                <h4 className="font-bold text-base mt-1">{item.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    // Se houve uma busca mas não encontrou resultados
    if (query) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{query}"</h2>
          <p className="text-[#A0AEC0] mt-2">Tente uma busca diferente.</p>
        </div>
      );
    }
    
    // Estado inicial antes de qualquer busca
    return null;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        <h1 className="text-5xl font-bold text-[#2D3748] mb-2">Resultados da Busca</h1>
        {query ? (
          <p className="text-[#A0AEC0] mb-6">Mostrando resultados para: <span className="font-semibold text-[#2D3748]">{query}</span></p>
        ) : (
          <p className="text-[#A0AEC0] mb-6">Comece uma busca pela barra de pesquisa no topo da página.</p>
        )}

        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
