import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const mockDatabase = [
  { id: 1, title: 'Duna', image: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05ESeaB.jpg', type: 'Filme' },
  { id: 2, title: 'Game of Thrones', image: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', type: 'Filme' },
  { id: 3, title: 'A Origem', image: 'https://image.tmdb.org/t/p/w500/9e32k0A8kE24QZ5gAAzY2oVvsb.jpg', type: 'Filme' },
  { id: 4, title: 'Stranger Things', image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', type: 'Filme' },
];

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = mockDatabase.filter(item =>
        item.title.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  }, [query]); 

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
          {results.length > 0 ? (
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
          ) : (
            query && (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{query}"</h2>
                <p className="text-[#A0AEC0] mt-2">Tente uma busca diferente.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;