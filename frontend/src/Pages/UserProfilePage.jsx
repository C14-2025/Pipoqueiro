import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFilm, BsStarHalf, BsPencil } from 'react-icons/bs';
import { authService, reviewService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Carrega perfil e reviews em paralelo
      const [profileData, reviewsData] = await Promise.all([
        authService.getProfile(),
        reviewService.getMyReviews()
      ]);

      setUserData(profileData);
      setUserReviews(reviewsData || []);
      setEditData(profileData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await authService.updateProfile(editData);
      setUserData(editData);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (name) => {
    if (userData?.foto_perfil) return userData.foto_perfil;
    const seed = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 123;
    return `https://i.pravatar.cc/150?u=${seed}`;
  };

  const totalReviews = userReviews.length;
  const averageRating = totalReviews > 0 ? (userReviews.reduce((acc, review) => acc + review.nota, 0) / totalReviews).toFixed(1) : 0;

  const StarRating = ({ rating }) => (
    <div className="flex text-[#FF8C42]">
      {[...Array(rating)].map((_, i) => <span key={i}>&#9733;</span>)}
      {[...Array(5 - rating)].map((_, i) => <span key={i} className="text-gray-300">&#9733;</span>)}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center py-20">
        <div className="text-red-500 text-lg">{error || 'Erro ao carregar perfil'}</div>
        <button
          onClick={loadUserProfile}
          className="mt-4 bg-[#00B5AD] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

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

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#00B5AD] text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <BsPencil />
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
          <img
            src={getAvatarUrl(userData.nome)}
            alt={userData.nome}
            className="w-32 h-32 rounded-full shadow-md"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.nome || ''}
                  onChange={(e) => setEditData({...editData, nome: e.target.value})}
                  className="text-4xl font-bold bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="Nome"
                />
                <input
                  type="url"
                  value={editData.foto_perfil || ''}
                  onChange={(e) => setEditData({...editData, foto_perfil: e.target.value})}
                  className="bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="URL da foto de perfil"
                />
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="Fale um pouco sobre você..."
                  rows="3"
                />
                <button
                  onClick={handleSaveProfile}
                  className="bg-[#FF8C42] text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-5xl font-bold text-[#2D3748]">{userData.nome}</h1>
                <p className="text-lg text-[#A0AEC0] mt-1">{userData.email}</p>
                {userData.bio && (
                  <p className="text-gray-600 mt-2">{userData.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Membro desde: {new Date(userData.created_at).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </>
            )}
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
                  <div className="w-20 h-28 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                    {/* Placeholder para poster do filme - seria necessário buscar da API de filmes */}
                    🎬
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-lg text-[#2D3748]">Filme ID: {review.tmdb_id}</p>
                      <div className="text-right">
                        <StarRating rating={review.nota} />
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {review.titulo_review && (
                      <p className="font-semibold text-[#2D3748] mb-1">"{review.titulo_review}"</p>
                    )}

                    {review.comentario && (
                      <p className="text-gray-600">{review.comentario}</p>
                    )}

                    {review.spoiler && (
                      <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        ⚠️ Spoiler
                      </span>
                    )}

                    {review.curtidas > 0 && (
                      <p className="text-sm text-[#00B5AD] mt-2">
                        ❤️ {review.curtidas} curtida{review.curtidas !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-500 text-lg">Você ainda não fez nenhuma avaliação.</p>
                <Link
                  to="/"
                  className="inline-block mt-4 bg-[#00B5AD] text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Avaliar Filmes
                </Link>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfilePage;