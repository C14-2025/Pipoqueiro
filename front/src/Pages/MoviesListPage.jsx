import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsArrowUp, BsArrowDown } from 'react-icons/bs';

const initialMoviesList = [
  { id: 1, rank: 1, title: 'Um Sonho de Liberdade', year: 1994, duration: '2h 22m', rating: 9.3, popularity: 98, poster: 'https://image.tmdb.org/t/p/w200/hBcY0fE9pfXzvVaY4GixFNLaGan.jpg' },
  { id: 2, rank: 2, title: 'O Poderoso Chefão', year: 1972, duration: '2h 55m', rating: 9.2, popularity: 95, poster: 'https://image.tmdb.org/t/p/w200/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 3, rank: 3, title: 'Batman: O Cavaleiro das Trevas', year: 2008, duration: '2h 32m', rating: 9.0, popularity: 100, poster: 'https://image.tmdb.org/t/p/w200/iGZX91hIqM9Uu0KGhd4MUaJ0Rtm.jpg' },
  { id: 4, rank: 4, title: 'A Lista de Schindler', year: 1993, duration: '3h 15m', rating: 8.9, popularity: 89, poster: 'https://image.tmdb.org/t/p/w200/sF1U4EUQS8YHUYDFwy9c6lffsSC.jpg' },
  { id: 5, rank: 5, title: '12 Homens e uma Sentença', year: 1957, duration: '1h 36m', rating: 8.9, popularity: 85, poster: 'https://image.tmdb.org/t/p/w200/bVBTkj1AlT1w2A5T74s2R4Vj2y5.jpg' },
];

const MoviesListPage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedMovies = useMemo(() => {
    return [...initialMoviesList].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] - b[sortBy];
      } else {
        return b[sortBy] - a[sortBy];
      }
    });
  }, [sortBy, sortOrder]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        <div className="border-l-4 border-[#FF8C42] pl-4 mb-8">
          <h1 className="text-5xl font-bold text-[#2D3748]">Top 250 Filmes</h1>
          <p className="text-[#A0AEC0] mt-1">Conforme avaliado pela comunidade Pipoqueiro.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#A0AEC0] font-semibold">Classificar por:</span>
              <button 
                onClick={() => setSortBy('rank')}
                className={`font-semibold transition-colors cursor-pointer ${sortBy === 'rank' ? 'text-[#00B5AD] border-b-2 border-[#00B5AD]' : 'text-[#2D3748] hover:text-[#00B5AD]'}`}
              >
                Classificação
              </button>
              <button 
                onClick={() => setSortBy('popularity')}
                className={`font-semibold transition-colors cursor-pointer ${sortBy === 'popularity' ? 'text-[#00B5AD] border-b-2 border-[#00B5AD]' : 'text-[#2D3748] hover:text-[#00B5AD]'}`}
              >
                Popularidade
              </button>
              <button 
                onClick={() => setSortBy('year')}
                className={`font-semibold transition-colors cursor-pointer ${sortBy === 'year' ? 'text-[#00B5AD] border-b-2 border-[#00B5AD]' : 'text-[#2D3748] hover:text-[#00B5AD]'}`}
              >
                Ano
              </button>
            </div>
            <button 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 text-[#2D3748] font-semibold p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sortOrder === 'desc' ? <BsArrowDown /> : <BsArrowUp />}
              <span>{sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {sortedMovies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                <img src={movie.poster} alt={movie.title} className="w-16 h-auto rounded-md" />
                <div className="flex-grow">
                  <Link to={`/filme/${movie.id}`} className="hover:underline">
                    <h2 className="text-xl font-bold text-[#2D3748]">{movie.rank}. {movie.title}</h2>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-[#A0AEC0] mt-1">
                    <span>{movie.year}</span>
                    <span>{movie.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-yellow-500">&#9733;</span>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MoviesListPage;