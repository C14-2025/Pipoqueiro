import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import { UserListsProvider } from './context/UserListsContext'; 

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import MediaDetailsPage from './Pages/MediaDetailsPage';
import YourListPage from './Pages/YourListPage';
import SearchPage from './Pages/SearchPage';
import UserProfilePage from './Pages/UserProfilePage';
import MoviesListPage from './Pages/MoviesListPage';


function App() {
  return (
    <UserListsProvider> 
      <div className="bg-[#FFFFFF] text-[#2D3748] font-sans flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/filme/:id" element={<MediaDetailsPage />} />
            <Route path="/serie/:id" element={<MediaDetailsPage />} />
            <Route path="/minha-lista" element={<YourListPage />} /> 
            <Route path="/busca" element={<SearchPage />} />     
            <Route path="/perfil" element={<UserProfilePage />} />   
            <Route path="/filmes" element={<MoviesListPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserListsProvider>
  );
}

export default App;