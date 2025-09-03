import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFilm, BsStarHalf } from 'react-icons/bs';

const UserProfilePage = () => {
  const navigate = useNavigate();

  const userData = {
    name: 'Jordan Santos',
    email: 'jordan.santos@exemplo.com',
    memberSince: 'Agosto de 2024',
    avatar: 'https://i.pravatar.cc/150?u=jordan',
  };

  const userReviews = [
    { id: 1, movie: 'Duna', rating: 5, text: 'Um dos melhores filmes de ficção científica que já vi! Visualmente deslumbrante.', poster: 'https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05ESeaB.jpg' },
    { id: 2, movie: 'Game of Thrones', rating: 4, text: 'Final controverso, mas a jornada foi épica.', poster: 'https://image.tmdb.org/t/p/w200/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg' },
    { id: 3, movie: 'A Origem', rating: 5, text: 'Uma obra-prima! A fotografia e a trilha sonora são espetaculares.', poster: 'https://image.tmdb.org/t/p/w200/9e32k0A8kE24QZ5gAAzY2oVvsb.jpg' },
  ];
  
  const totalReviews = userReviews.length;
  const averageRating = totalReviews > 0 ? (userReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1) : 0;

  const StarRating = ({ rating }) => (
    <div className="flex text-[#FF8C42]">
      {[...Array(rating)].map((_, i) => <span key={i}>&#9733;</span>)}
      {[...Array(5 - rating)].map((_, i) => <span key={i} className="text-gray-300">&#9733;</span>)}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        
        <div className="flex justify-between items-center mb-8">
            <button 
                onClick={() => navigate(-1)}
                className="text-[#A0AEC0] font-semibold hover:text-[#00B5AD] transition-colors flex items-center gap-2 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Voltar
            </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
          <img src={userData.avatar} alt={userData.name} className="w-32 h-32 rounded-full shadow-md" />
          <div>
            <h1 className="text-5xl font-bold text-[#2D3748]">{userData.name}</h1>
            <p className="text-lg text-[#A0AEC0] mt-1">{userData.email}</p>
            <p className="text-sm text-gray-500 mt-2">Membro desde: {userData.memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-center">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <BsFilm className="mx-auto text-3xl text-[#00B5AD]" />
            <p className="text-2xl font-bold text-[#2D3748] mt-2">{totalReviews}</p>
            <p className="text-[#A0AEC0] text-sm">Críticas Publicadas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <BsStarHalf className="mx-auto text-3xl text-[#FF8C42]" />
            <p className="text-2xl font-bold text-[#2D3748] mt-2">{averageRating}</p>
            <p className="text-[#A0AEC0] text-sm">Nota Média</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-semibold text-[#2D3748] mb-4">Minhas Avaliações</h2>
          <div className="space-y-6">
            {userReviews.length > 0 ? (
              userReviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                  <img src={review.poster} alt={review.movie} className="w-20 h-auto rounded-md shadow-sm" />
                  <div>
                    <p className="font-bold text-lg text-[#2D3748]">{review.movie}</p>
                    <StarRating rating={review.rating} />
                    <p className="text-md text-gray-600 mt-2">"{review.text}"</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Você ainda não fez nenhuma avaliação.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfilePage;