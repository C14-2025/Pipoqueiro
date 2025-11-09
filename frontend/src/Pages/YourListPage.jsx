import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBookmarkHeart } from 'react-icons/bs';
import { useUserLists } from '../context/UserListsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { watchlistService, authService } from '../services/api';
import { toast } from 'react-toastify';

const YourListPage = () => {
    const navigate = useNavigate();
    const { isLoggedIn, loadLists, toggleWatchlist } = useUserLists();
    const [listMovies, setListMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWatchlistDetails = useCallback(async () => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await watchlistService.getWatchlist();
            setListMovies(data);
            
        } catch (err) {
            console.error('Erro ao buscar detalhes da lista:', err);
            setError('Não foi possível carregar sua lista. Verifique a conexão com o servidor.');
            setListMovies([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchWatchlistDetails();
    }, [fetchWatchlistDetails]);
    
    const handleRemoveFromList = async (e, movieId) => {
        e.preventDefault();
        e.stopPropagation();
        
        setListMovies(prev => prev.filter(movie => (movie.tmdb_id || movie.id) !== movieId));
        
        try {
            await toggleWatchlist(movieId);
            toast.success('Filme removido da sua lista.');
        } catch(err) {
            toast.error('Erro ao remover filme. Sincronizando...');
            loadLists(); 
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingSpinner size="lg" className="py-20" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center py-20">
                <h2 className="text-2xl font-semibold text-red-500 mb-4">{error}</h2>
                <button 
                    onClick={fetchWatchlistDetails}
                    className="mt-4 bg-[#00B5AD] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

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
                    <p className="text-[#A0AEC0] mt-1 ml-14">{listMovies.length} filme(s) que você salvou para assistir depois.</p>
                </div>
                
                {listMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {listMovies.map(item => (
                            <Link 
                                to={`/filme/${item.tmdb_id || item.id}`} 
                                key={item.tmdb_id || item.id} 
                                className="relative rounded-lg overflow-hidden group shadow-lg aspect-[2/3]"
                            >
                                <img 
                                    src={item.poster_url || 'https://via.placeholder.com/300x450/f4f6f8/a0aec0?text=🎬'} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-3 text-white">
                                    <h4 className="font-bold text-base mt-1">{item.title}</h4>
                                </div>
                                
                                <button
                                    onClick={(e) => handleRemoveFromList(e, item.tmdb_id || item.id)}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 cursor-pointer"
                                    aria-label="Remover da lista"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
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