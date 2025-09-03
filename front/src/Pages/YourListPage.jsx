import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBookmarkHeart } from 'react-icons/bs';

const YourListPage = () => {
  const navigate = useNavigate();

  const userList = [
    { id: 4, title: 'Stranger Things', image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', type: 'Série' },
    { id: 2, title: 'A Origem', image: 'https://image.tmdb.org/t/p/w500/9e32k0A8kE24QZ5gAAzY2oVvsb.jpg', type: 'Filme' },
    { id: 3, title: 'Duna', image: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05ESeaB.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
    { id: 5, title: 'Duna: Parte Dois', image: 'https://image.tmdb.org/t/p/w500/1m1rXopfNDVL3b4l6k55YE4sYd6.jpg', type: 'Filme' },
  ];

  const gameOfThronesId = 2;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#A0AEC0] font-semibold hover:text-[#00B5AD] transition-colors flex items-center gap-2 cursor-pointer mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <BsBookmarkHeart className="text-4xl text-[#00B5AD]" />
            <h1 className="text-5xl font-bold text-[#2D3748]">Sua Lista</h1>
          </div>
          <p className="text-[#A0AEC0] mt-1 ml-14">Filmes que você salvou para assistir depois.</p>
        </div>
        
        {userList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {userList.map(item => (
              <Link to={`/serie/${gameOfThronesId}`} key={item.id} className="relative rounded-lg overflow-hidden group shadow-lg aspect-[2/3]">
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
          <div className="text-center py-20 border-t border-gray-200 mt-6">
            <h2 className="text-2xl font-semibold text-[#2D3748]">Sua lista está vazia!</h2>
            <p className="text-[#A0AEC0] mt-2">Adicione filmes e séries que você quer assistir.</p>
            <Link to="/">
              <button className="mt-6 bg-[#00B5AD] text-white font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity">
                Explorar filmes e séries
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourListPage;