import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsHeart, BsHeartFill, BsPlay, BsStar, BsStarFill } from 'react-icons/bs';
import { useUserLists } from '../context/UserListsContext'; 

const MovieCard = ({ movie }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
  
    const { isMovieInFavorites, toggleFavorites, isLoggedIn } = useUserLists();
    const isInFavorites = isMovieInFavorites(movie.id);

    const releaseYear = new Date(movie.release_date).getFullYear();
    const ourRating = Math.round(movie.vote_average / 2); 

    const handleToggleFavorites = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        if (!isLoggedIn) {
            alert('Você precisa estar logado para curtir este filme!');
            return;
        }

        toggleFavorites(movie.id); 
    };

    return (
        <div 
            className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[2/3] bg-gradient-to-b from-gray-200 to-gray-300 overflow-hidden">
        
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                )}
        
                <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                        isHovered ? 'scale-110' : 'scale-100'
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x450/f4f6f8/a0aec0?text=🎬';
                    }}
                />
        
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
        
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                    {releaseYear}
                </div>
        
                <button
                    onClick={handleToggleFavorites}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 transform z-20 cursor-pointer 
                    ${
                        isInFavorites 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110' 
                            : 'bg-black/50 text-white hover:bg-red-500 hover:scale-110'
                    } 
                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    {isInFavorites ? <BsHeartFill className="h-4 w-4" /> : <BsHeart className="h-4 w-4" />}
                </button>
                <Link to={`/filme/${movie.id}`} className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                    <div className="bg-[#00B5AD] hover:bg-[#009A93] text-white p-4 rounded-full shadow-lg transform transition-transform hover:scale-110">
                        <BsPlay className="h-6 w-6 ml-1" />
                    </div>
                </Link>
            </div>

            <div className="p-4 space-y-3">
                <h3 className="font-bold text-[#2D3748] text-sm leading-tight line-clamp-2 group-hover:text-[#00B5AD] transition-colors duration-300">
                    {movie.title}
                </h3>
        
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#A0AEC0] font-medium">TMDb</span>
                        <div className="flex items-center space-x-1">
                            <StarRating rating={ourRating} />
                            <span className="text-xs text-[#A0AEC0] ml-1">
                                {movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StarRating = ({ rating }) => (
    <div className="flex text-[#FF8C42]">
        {[...Array(5)].map((_, i) => (
            i < rating ? 
                <BsStarFill key={i} className="h-3 w-3" /> : 
                <BsStar key={i} className="h-3 w-3 text-gray-300" />
        ))}
    </div>
);

export default MovieCard;