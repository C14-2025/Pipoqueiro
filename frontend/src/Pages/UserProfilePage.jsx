import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFilm, BsStarHalf, BsPencil } from 'react-icons/bs';
import { authService, reviewService, movieService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

// Lista de gêneros fixa, já que a API não fornece
const allGenres = [
  'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Documentário', 
  'Drama', 'Família', 'Fantasia', 'História', 'Terror', 'Música', 
  'Mistério', 'Romance', 'Ficção Científica', 'Cinema TV', 'Thriller', 
  'Guerra', 'Faroeste'
];

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ generos_favoritos: [] });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reviewedMovieDetails, setReviewedMovieDetails] = useState({});

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

      const [profileData, reviewsData] = await Promise.all([
        authService.getProfile(), // Atualiza o localStorage com a "verdade" do DB
        reviewService.getMyReviews(),
      ]);

      setUserData(profileData);
      setUserReviews(reviewsData || []);

      const formattedEditData = {
        ...profileData,
        generos_favoritos: profileData.generos_favoritos || [],
        data_nascimento: profileData.data_nascimento 
          ? profileData.data_nascimento.split('T')[0] // Pega só o 'YYYY-MM-DD'
          : null
      };
      setEditData(formattedEditData);

    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMovieDetailsForReviews = async () => {
      if (userReviews.length === 0) return;

      const uniqueMovieIds = [
        ...new Set(userReviews.map((review) => review.tmdb_id)),
      ];
      const detailsMap = {};

      for (const tmdbId of uniqueMovieIds) {
        try {
          const movieDetails = await movieService.getMovieDetails(tmdbId);
          detailsMap[tmdbId] = movieDetails;
        } catch (err) {
          console.error(`Erro ao buscar detalhes do filme ${tmdbId}:`, err);
          detailsMap[tmdbId] = {
            title: 'Filme Desconhecido',
            poster_url: 'https://via.placeholder.com/90x135?text=No+Image',
          };
        }
      }
      setReviewedMovieDetails(detailsMap);
    };

    fetchMovieDetailsForReviews();
  }, [userReviews]);

  const handleGenreChange = (genreName) => {
    const genreKey = genreName.toLowerCase(); 
    const currentGenres = editData.generos_favoritos || [];
    const isSelected = currentGenres.includes(genreKey);

    let newGenres;
    if (isSelected) {
      newGenres = currentGenres.filter((name) => name !== genreKey);
    } else {
      newGenres = [...currentGenres, genreKey];
    }
    setEditData({ ...editData, generos_favoritos: newGenres });
  };

  const handleSaveProfile = async () => {
    // Validação da Data de Nascimento (só se não existir)
    if (!userData.data_nascimento && !editData.data_nascimento) {
      toast.warn('Por favor, preencha sua data de nascimento.');
      return;
    }
    
    // Valida os gêneros apenas se eles ainda não foram salvos
    if ((!userData.generos_favoritos || userData.generos_favoritos.length === 0) && 
        (!editData.generos_favoritos || editData.generos_favoritos.length < 3)) {
      toast.warn('Por favor, selecione pelo menos 3 gêneros favoritos.');
      return;
    }

    try {
      setLoading(true);

      const dataToUpdate = {
        nome: editData.nome,
        bio: editData.bio,
        foto_perfil: editData.foto_perfil,
        data_nascimento: editData.data_nascimento,
        generos_favoritos: editData.generos_favoritos
      };

      await authService.updateProfile(dataToUpdate); 
      
      // --- CORREÇÃO DO BUG DO F5 ---
      // Buscamos os dados REAIS do banco de dados após salvar
      await loadUserProfile();
      
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      toast.error(err.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      setError(err.message || 'Erro ao excluir conta. Tente novamente.');
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvatarUrl = (name) => {
    if (userData?.foto_perfil) return userData.foto_perfil;
    const seed =
      name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 123;
    return `https://i.pravatar.cc/150?u=${seed}`;
  };

  const totalReviews = userReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          userReviews.reduce((acc, review) => acc + review.nota, 0) /
          totalReviews
        ).toFixed(1)
      : 0;

  const StarRating = ({ rating }) => (
    <div className="flex text-[#FF8C42]">
      {[...Array(Math.floor(rating))].map((_, i) => (
        <span key={i}>&#9733;</span>
      ))}
      {rating % 1 >= 0.5 && <span key="half">&#9733;</span>}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">
          &#9733;
        </span>
      ))}
    </div>
  );

  const isProfileIncomplete = !userData?.data_nascimento || !userData?.generos_favoritos || userData.generos_favoritos.length < 3;


  if (loading && Object.keys(reviewedMovieDetails).length === 0) {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Voltar
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 transition-colors ${
              isProfileIncomplete && !isEditing 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse' 
                : 'bg-[#00B5AD] hover:bg-[#009A92]'
            }`}
          >
            <BsPencil />
            {isEditing ? 'Cancelar' : (isProfileIncomplete ? 'Completar Perfil' : 'Editar Perfil')}
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
              // --- MODO DE EDIÇÃO ---
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.nome || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, nome: e.target.value })
                  }
                  className="text-4xl font-bold bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="Nome"
                />
                <input
                  type="url"
                  value={editData.foto_perfil || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, foto_perfil: e.target.value })
                  }
                  className="bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="URL da foto de perfil"
                />
                
                <div>
                  <label htmlFor="data_nascimento" className="text-sm font-semibold text-gray-700">Data de Nascimento:</label>
                  <input
                    id="data_nascimento"
                    type="date"
                    value={editData.data_nascimento || ''}
                    onChange={(e) => setEditData({...editData, data_nascimento: e.target.value})}
                    disabled={!!userData.data_nascimento}
                    className="bg-white border rounded-lg px-3 py-2 w-full mt-1 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>

                <textarea
                  value={editData.bio || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  className="bg-white border rounded-lg px-3 py-2 w-full"
                  placeholder="Fale um pouco sobre você..."
                  rows="3"
                />

                <div>
                  <label className="text-sm font-semibold text-gray-700">Gêneros Favoritos (mínimo 3):</label>
                  <div className="flex flex-wrap gap-3 mt-2 p-3 bg-gray-100 rounded-lg max-h-48 overflow-y-auto border">
                    {allGenres.map((genreName) => (
                      <label 
                        key={genreName} 
                        className={`flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 
                        ${(!!userData.generos_favoritos && userData.generos_favoritos.length > 0) && 'opacity-60 bg-gray-100 cursor-not-allowed'}`}
                      >
                        <input
                          type="checkbox"
                          checked={editData.generos_favoritos?.includes(genreName.toLowerCase())}
                          onChange={() => handleGenreChange(genreName)}
                          disabled={!!userData.generos_favoritos && userData.generos_favoritos.length > 0}
                          className="rounded text-[#00B5AD] focus:ring-[#00B5AD] disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-700">{genreName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="bg-[#FF8C42] text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              // --- MODO DE VISUALIZAÇÃO ---
              <>
                <h1 className="text-5xl font-bold text-[#2D3748]">
                  {userData.nome}
                </h1>
                <p className="text-lg text-[#A0AEC0] mt-1">{userData.email}</p>
                {userData.bio && (
                  <p className="text-gray-600 mt-2">{userData.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Membro desde:{' '}
                  {new Date(userData.created_at).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>

                {userData.data_nascimento && (
                  <p className="text-sm text-gray-500 mt-2">
                    Nascimento: {new Date(userData.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                )}
                
                {userData.generos_favoritos && userData.generos_favoritos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[#2D3748]">Gêneros Favoritos:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.generos_favoritos.map((genreName) => (
                        <span key={genreName} className="bg-[#FF8C42] text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                          {genreName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-center">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <BsFilm className="mx-auto text-3xl text-[#00B5AD]" />
            <p className="text-2xl font-bold text-[#2D3748] mt-2">
              {totalReviews}
            </p>
            <p className="text-[#A0AEC0] text-sm">Críticas Publicadas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <BsStarHalf className="mx-auto text-3xl text-[#FF8C42]" />
            <p className="text-2xl font-bold text-[#2D3748] mt-2">
              {averageRating}
            </p>
            <p className="text-[#A0AEC0] text-sm">Nota Média</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-semibold text-[#2D3748] mb-4">
            Minhas Avaliações
          </h2>
          <div className="space-y-6">
            {userReviews.length > 0 ? (
              userReviews.map((review) => {
                const movie = reviewedMovieDetails[review.tmdb_id] || {
                  title: 'Carregando...',
                  poster_url: 'https://via.placeholder.com/90x135?text=No+Image',
                };
                return (
                  <div
                    key={review.id}
                    className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <Link to={`/filme/${review.tmdb_id}`}>
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-20 h-28 object-cover rounded-md shadow-sm"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          to={`/filme/${review.tmdb_id}`}
                          className="font-bold text-lg text-[#2D3748] hover:text-[#FF8C42] transition-colors"
                        >
                          {movie.title}
                        </Link>
                        <div className="text-right">
                          <StarRating rating={review.nota} />
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(
                              'pt-BR'
                            )}
                          </p>
                        </div>
                      </div>

                      {review.titulo_review && (
                        <p className="font-semibold text-[#2D3748] mb-1">
                          "{review.titulo_review}"
                        </p>
                      )}

                      {review.comentario && (
                        <p className="text-gray-600">{review.comentario}</p>
                      )}

                      {review.spoiler ? (
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          ⚠️ Spoiler
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-500 text-lg">
                  Você ainda não fez nenhuma avaliação.
                </p>
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

        <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
          <h2 className="text-2xl font-semibold text-[#2D3748] mb-4">
            Configurações da Conta
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-300"
            >
              Sair da Conta
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              Apagar Conta
            </button>
          </div>
        </div>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Confirmar Exclusão
              </h3>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja apagar sua conta? Esta ação é{' '}
                <strong>irreversível</strong> e todos os seus dados serão
                perdidos permanentemente, incluindo:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li>Todas as suas avaliações</li>
                <li>Dados do perfil</li>
                <li>Histórico de atividades</li>
              </ul>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
                >
                  {isDeleting ? 'Apagando...' : 'Sim, Apagar Conta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;