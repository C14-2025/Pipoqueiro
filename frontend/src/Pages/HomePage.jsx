import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBookmark, BsHeartFill, BsHeart } from 'react-icons/bs';
import MovieCard from '../components/MovieCard';
import LoadingSpinner, { MovieGridSkeleton } from '../components/LoadingSpinner';
import { movieService } from '../services/api';
import { useUserLists } from '../context/UserListsContext';

const StarRating = ({ rating }) => {
    const validRating = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <div className="flex text-[#FF8C42]">
            {[...Array(validRating)].map((_, i) => <span key={i}>&#9733;</span>)}
            {[...Array(5 - validRating)].map((_, i) => <span key={i} className="text-gray-300">&#9733;</span>)}
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const [topMovies, setTopMovies] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [moreMovies, setMoreMovies] = useState([]);
    const [evenMoreMovies, setEvenMoreMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { toggleFavorites, isMovieInFavorites, isLoggedIn } = useUserLists();

    const adaptApiData = (movies, initialRank = 1) => {
        return movies.map((movie, index) => ({
            id: movie.id,
            rank: initialRank + index,
            title: movie.title,
            image: movie.poster_url,
            rating: movie.vote_average / 2,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            nossa_stats: movie.nossa_stats
        }));
    };

    useEffect(() => {
        const loadInitialMovies = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await movieService.getPopular(1);
                const adaptedMovies = adaptApiData(data);

                setTopMovies(adaptedMovies.slice(0, 2));
                setTrendingMovies(adaptedMovies.slice(2, 7));
                setMoreMovies(adaptedMovies.slice(7, 12));
                setEvenMoreMovies(adaptedMovies.slice(12, 17));

            } catch (err) {
                console.error('Erro ao carregar filmes:', err);
                setError('Não foi possível carregar os filmes. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialMovies();
    }, []);

    const handleTopMovieToggle = (e, movieId) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/login?message=favorite');
            return;
        }
        toggleFavorites(movieId);
    };

    if (loading) {
        return (
            <div className="container mx-auto flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00B5AD]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto text-center py-20">
                <p className="text-red-500 text-2xl mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#00B5AD] text-white font-semibold py-2 px-5 rounded-full hover:opacity-90 transition"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const isTopMovieFavorite = (movieId) => isMovieInFavorites(movieId);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">

                <section className="mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h2 className="text-2xl text-[#A0AEC0]">Encontre o seu próximo filme...</h2>
                            <h1 className="text-5xl font-bold text-[#2D3748]">Top Filmes do Momento</h1>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-3 mt-4 sm:mt-0">
                            {isLoggedIn && (
                                <Link to="/minha-lista" className="flex items-center gap-3 bg-[#00B5AD]/20 text-[#00B5AD] font-semibold py-2 px-4 rounded-full transition hover:bg-[#00B5AD]/30">
                                    <BsBookmark />
                                    <span>Minha Lista</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {topMovies.length >= 2 && (
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {[0, 1].map((idx) => {
                            const movie = topMovies[idx];
                            const isInList = isTopMovieFavorite(movie.id);
                            const pipoqueiroRating = movie.nossa_stats?.nota_media;

                            return (
                                <div key={movie.id} className="bg-[#FFFFFF] rounded-2xl overflow-hidden relative h-72 group shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    <button
                                            onClick={(e) => handleTopMovieToggle(e, movie.id)}
                                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 transform z-30 cursor-pointer
                                                ${
                                                    isInList
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110'
                                                    : 'bg-black/50 text-white hover:bg-red-500 hover:scale-110'
                                                }`}
                                        >
                                            {isInList ? <BsHeartFill className="h-5 w-5" /> : <BsHeart className="h-5 w-5" />}
                                    </button>

                                    <Link to={`/filme/${movie.id}`} className="absolute inset-0 z-10" />

                                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">{movie.title}</h3>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                                            <div className="flex flex-col gap-1 items-start mb-1 sm:mb-0">
                                                <div className="flex items-center space-x-3">
                                                    <StarRating rating={movie.rating} />
                                                    <span className="text-white/90 text-sm font-medium drop-shadow-lg">{movie.vote_average.toFixed(1)}/10 (TMDb)</span>
                                                </div>
                                                {pipoqueiroRating && pipoqueiroRating > 0 && (
                                                    <div className="flex items-center space-x-3">
                                                        <StarRating rating={pipoqueiroRating} />
                                                        <span className="text-white/90 text-sm font-medium drop-shadow-lg">{parseFloat(pipoqueiroRating).toFixed(1)}/5 (Pipoqueiro)</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="sm:mt-0">
                                                <Link to={`/filme/${movie.id}`} className="inline-flex items-center bg-[#00B5AD] hover:bg-[#009A93] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg z-30 relative">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 mr-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25l13.5 6.75-13.5 6.75V5.25z" />
                                                    </svg>
                                                    Ver Detalhes
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Tendências Atuais</h2>
                    {loading ? (
                        <MovieGridSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {trendingMovies.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={{
                                        ...movie,
                                        poster_url: movie.image,
                                        vote_average: movie.vote_average || 0,
                                        release_date: movie.release_date || new Date().toISOString(),
                                        nossa_stats: movie.nossa_stats
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="mb-12">
                    {loading ? (
                        <MovieGridSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {moreMovies.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={{
                                        ...movie,
                                        poster_url: movie.image,
                                        vote_average: movie.vote_average || 0,
                                        release_date: movie.release_date || new Date().toISOString(),
                                        nossa_stats: movie.nossa_stats
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>
                
                <section className="mb-12">
                    {loading ? (
                        <MovieGridSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {evenMoreMovies.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={{
                                        ...movie,
                                        poster_url: movie.image,
                                        vote_average: movie.vote_average || 0,
                                        release_date: movie.release_date || new Date().toISOString(),
                                        nossa_stats: movie.nossa_stats
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default HomePage;