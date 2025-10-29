import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { watchlistService, favoritesService, authService } from '../services/api'; 

const UserListsContext = createContext();

export const useUserLists = () => useContext(UserListsContext);

export const UserListsProvider = ({ children }) => {
    const [watchlistIds, setWatchlistIds] = useState(new Set()); 
    const [favoritesIds, setFavoritesIds] = useState(new Set()); 
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

    const loadLists = useCallback(async () => {
        const authStatus = authService.isAuthenticated();
        setIsLoggedIn(authStatus);
        
        if (!authStatus) {
            setWatchlistIds(new Set());
            setFavoritesIds(new Set());
            return;
        }
        
        setLoading(true);
        try {
            const [watchlist, favorites] = await Promise.all([
                watchlistService.getWatchlist(),
                favoritesService.getFavorites(),
            ]);

            setWatchlistIds(new Set(watchlist.map(item => parseInt(item.tmdb_id) || parseInt(item.id)).filter(id => !isNaN(id))));
            setFavoritesIds(new Set(favorites.map(item => parseInt(item.tmdb_id) || parseInt(item.id)).filter(id => !isNaN(id))));
            
        } catch (error) {
            console.error('Erro ao carregar listas do usuário. Verifique se o backend está rodando e conectado ao DB:', error);
            setWatchlistIds(new Set());
            setFavoritesIds(new Set());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLists();

        const handleStorageChange = () => {
            loadLists();
        };
        window.addEventListener('storage', handleStorageChange);
        
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadLists]);


    const toggleList = async (tmdbId, isFavorite = false) => {
        if (!isLoggedIn) {
            alert('Você precisa estar logado para adicionar filmes à sua lista!');
            return false;
        }

        const tmdbIdInt = parseInt(tmdbId);
        if (isNaN(tmdbIdInt)) return false;

        const [ids, setter, service] = isFavorite 
            ? [favoritesIds, setFavoritesIds, favoritesService]
            : [watchlistIds, setWatchlistIds, watchlistService];
        
        const isCurrentlyInList = ids.has(tmdbIdInt);
        
        const newSet = new Set(ids);
        if (isCurrentlyInList) {
            newSet.delete(tmdbIdInt);
        } else {
            newSet.add(tmdbIdInt);
        }
        setter(newSet);

        try {
            if (isCurrentlyInList) {
                await (isFavorite ? service.removeFromFavorites(tmdbIdInt) : service.removeFromWatchlist(tmdbIdInt));
            } else {
                await (isFavorite ? service.addToFavorites(tmdbIdInt) : service.addToWatchlist(tmdbIdInt));
            }
            return true;
        } catch (error) {
            console.error(`Erro ao alternar lista (${isFavorite ? 'Favorites' : 'Watchlist'}):`, error);
            alert(`Erro ao atualizar sua lista. Tente novamente.`);
            setter(ids); 
            return false;
        }
    };

    const value = {
        watchlistIds,
        favoritesIds,
        loading,
        isLoggedIn,
        isMovieInWatchlist: (tmdbId) => watchlistIds.has(parseInt(tmdbId)),
        isMovieInFavorites: (tmdbId) => favoritesIds.has(parseInt(tmdbId)),
        toggleWatchlist: (tmdbId) => toggleList(tmdbId, false),
        toggleFavorites: (tmdbId) => toggleList(tmdbId, true),
        loadLists,
    };

    return (
        <UserListsContext.Provider value={value}>
            {children}
        </UserListsContext.Provider>
    );
};