import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { watchlistService, favoritesService, authService } from '../services/api'; 
import { toast } from 'react-toastify';

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
            toast.warn('Você precisa estar logado para adicionar filmes à sua lista!');
            return false;
        }

        const tmdbIdInt = parseInt(tmdbId);
        if (isNaN(tmdbIdInt)) return false;

        const [, setter, service] = isFavorite 
            ? [favoritesIds, setFavoritesIds, favoritesService]
            : [watchlistIds, setWatchlistIds, watchlistService];
        
        let isRemoving = false;
        setter((currentIds) => {
            const newSet = new Set(currentIds);
            if (currentIds.has(tmdbIdInt)) {
                newSet.delete(tmdbIdInt);
                isRemoving = true;
            } else {
                newSet.add(tmdbIdInt);
                isRemoving = false; 
            }
            return newSet;
        });

        try {
            if (isRemoving) {
                await (isFavorite ? service.removeFromFavorites(tmdbIdInt) : service.removeFromWatchlist(tmdbIdInt));
            } else {
                await (isFavorite ? service.addToFavorites(tmdbIdInt) : service.addToWatchlist(tmdbIdInt));
            }
            return true;
        } catch (error) {
            console.error(`Erro ao alternar lista (${isFavorite ? 'Favorites' : 'Watchlist'}):`, error);
            toast.error('Erro ao atualizar sua lista. Tente novamente.');
            
            setter((currentIds) => {
              const newSet = new Set(currentIds);
              if (isRemoving) {
                newSet.add(tmdbIdInt);
              } else {
                newSet.delete(tmdbIdInt);
              }
              return newSet;
            });
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