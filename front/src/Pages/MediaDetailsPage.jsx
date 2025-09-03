import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BsBookmarkPlus } from 'react-icons/bs';

const MediaDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);

  const mockMediaData = {
    id: '1',
    title: 'Duna',
    originalTitle: 'Dune',
    releaseYear: '2021',
    rating: 4,
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05ESeaB.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/tDSb3jW9h003bU1oK8L73tJzC3T.jpg',
    genres: ['Ficção Científica', 'Aventura', 'Drama'],
    duration: '2h 35m',
    synopsis: "Paul Atreides, um jovem brilhante e talentoso com um destino grandioso para além da sua compreensão, tem de viajar para o planeta mais perigoso do universo para assegurar o futuro da sua família e do seu povo. À medida que forças malévolas irrompem em conflito, devido à exclusiva oferta de especiaria do planeta, apenas aqueles que conseguem dominar o seu medo irão sobreviver.",
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides', avatar: 'https://image.tmdb.org/t/p/w200/oEgtW9YVpD79HHYl1hTf6Hn2i86.jpg' },
      { name: 'Zendaya', character: 'Chani', avatar: 'https://image.tmdb.org/t/p/w200/uYfN5e63N9K7Bkm50hJ1y3X3KzS.jpg' },
      { name: 'Rebecca Ferguson', character: 'Lady Jessica', avatar: 'https://image.tmdb.org/t/p/w200/n0N1G123G786F35M3fU19D5T5R1.jpg' },
      { name: 'Oscar Isaac', character: 'Duke Leto Atreides', avatar: 'https://image.tmdb.org/t/p/w200/q2jP0oH9wXmJ3uV5Lg2tE5G9X7z.jpg' },
    ],
    reviews: [
      { id: 1, user: 'Carlos M.', avatar: 'https://i.pravatar.cc/150?u=carlos', rating: 5, text: 'Um dos melhores filmes de ficção científica que já vi! Visualmente deslumbrante.' },
      { id: 2, user: 'Beatriz L.', avatar: 'https://i.pravatar.cc/150?u=beatriz', rating: 4, text: 'Uma montanha-russa de emoções. Alguns deslizes no final, mas a jornada vale a pena.' },
    ]
  };

  const StarRating = ({ rating }) => (
    <div className="flex text-[#FF8C42]">
      {[...Array(rating)].map((_, i) => <span key={i}>&#9733;</span>)}
      {[...Array(5 - rating)].map((_, i) => <span key={i} className="text-gray-300">&#9733;</span>)}
    </div>
  );

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        <div 
          className="relative h-96 bg-cover bg-center rounded-2xl overflow-hidden mb-8 shadow-xl"
          style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%), url(${mockMediaData.backdrop})` }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/20 text-white hover:bg-white/40 hover:text-[#00B5AD] transition-colors flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>

          <div className="absolute bottom-0 left-0 p-8 text-white flex items-end">
            <img 
              src={mockMediaData.poster} 
              alt={mockMediaData.title} 
              className="w-40 h-auto rounded-lg shadow-lg mr-6 hidden md:block"
            />
            <div>
              <h1 className="text-5xl font-extrabold">{mockMediaData.title}</h1>
              <p className="text-xl mt-2">{mockMediaData.originalTitle} ({mockMediaData.releaseYear})</p>
              <div className="flex items-center mt-3 text-lg">
                <StarRating rating={mockMediaData.rating} />
                <span className="ml-3 text-gray-300">{mockMediaData.rating}.0 / 5</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {mockMediaData.genres.map((genre, index) => (
                  <span key={index} className="bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {genre}
                  </span>
                ))}
                <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {mockMediaData.duration}
                </span>
              </div>
            </div>
          </div>
          <button className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/40 hover:text-[#00B5AD] transition-colors flex items-center gap-2 px-3 py-2 rounded-full font-semibold cursor-pointer">
            <BsBookmarkPlus />
            Adicionar à Lista
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Sinopse</h2>
            <p className="text-[#A0AEC0] leading-relaxed mb-8">{mockMediaData.synopsis}</p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#2D3748] mb-3">Diretor</h3>
              <p className="text-[#A0AEC0]">{mockMediaData.director}</p>
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Deixe sua Avaliação</h2>
                <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-sm">
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

            <div>
                <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Avaliações da Comunidade</h2>
                <div className="space-y-4">
                  {mockMediaData.reviews.map((review) => (
                      <div key={review.id} className="bg-[#FFFFFF] p-4 rounded-lg shadow-sm">
                          <div className="flex items-center mb-2">
                              <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full mr-3" />
                              <div>
                                  <p className="font-bold text-[#2D3748]">{review.user}</p>
                                  <StarRating rating={review.rating} />
                              </div>
                          </div>
                          <p className="text-[#A0AEC0] text-sm">{review.text}</p>
                      </div>
                  ))}
                </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Elenco Principal</h2>
            <div className="space-y-4">
              {mockMediaData.cast.map((actor, index) => (
                <div key={index} className="flex items-center bg-[#FFFFFF] p-3 rounded-lg shadow-sm">
                  <img src={actor.avatar} alt={actor.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
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