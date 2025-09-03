import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsBookmark } from 'react-icons/bs';

// Importa o serviço de API que agora está a funcionar
import { movieService } from '../services/api';

// --- COMPONENTES AUXILIARES (do seu design original) ---
const StarRating = ({ rating }) => {
    // Garante que a avaliação seja um número entre 0 e 5
    const validRating = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <div className="flex text-[#FF8C42]">
            {[...Array(validRating)].map((_, i) => <span key={i}>&#9733;</span>)}
            {[...Array(5 - validRating)].map((_, i) => <span key={i} className="text-gray-300">&#9733;</span>)}
        </div>
    );
};

// Dados estáticos para as avaliações, como solicitado
const communityReviews = [
  { id: 1, user: 'João S.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e2906704d', rating: 5, text: 'Um dos melhores filmes de ficção científica que já vi! Visualmente deslumbrante.' },
  { id: 2, user: 'Mariana P.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', rating: 4, text: 'A trama política é complexa e os personagens são muito bem construídos.' },
  { id: 3, user: 'Lucas F.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', rating: 5, text: 'Uma obra-prima! A fotografia e a trilha sonora são espetaculares.' },
  { id: 4, user: 'Ana C.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', rating: 4, text: 'Final de temporada de tirar o fôlego. Mal posso esperar pela próxima!' },
];

const ReviewCard = ({ review }) => (
    <div className="bg-[#FFFFFF] p-4 rounded-lg shadow-md h-full">
        <div className="flex items-center mb-2">
            <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-bold text-[#2D3748]">{review.user}</p>
                <StarRating rating={review.rating} />
            </div>
        </div>
        <p className="text-[#A0AEC0] text-sm">{review.text}</p>
    </div>
);


// --- COMPONENTE PRINCIPAL COM DESIGN E API ---
const HomePage = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para adaptar os dados da API ao formato do design
  const adaptApiData = (movies, initialRank = 1) => {
    return movies.map((movie, index) => ({
      id: movie.id,
      rank: initialRank + index,
      title: movie.title,
      image: movie.poster_url,
      rating: movie.vote_average / 2,
    }));
  };
  
  // Efeito para carregar os filmes iniciais
  useEffect(() => {
    const loadInitialMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await movieService.getPopular(1); // Busca a primeira página de filmes
        const adaptedMovies = adaptApiData(data);
        
        setTopMovies(adaptedMovies.slice(0, 2)); // Pega os 2 primeiros para o topo
        setTrendingMovies(adaptedMovies.slice(2, 10)); // Pega os 8 seguintes para tendências

      } catch (err) {
        console.error('Erro ao carregar filmes:', err);
        setError('Não foi possível carregar os filmes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialMovies();
  }, []);

  // Ecrã de Carregamento (Loading)
  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00B5AD]"></div>
      </div>
    );
  }

  // Ecrã de Erro
  if (error) {
    return (
      <div className="container mx-auto text-center py-20">
        <p className="text-red-500 text-2xl mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} // Recarrega a página para tentar novamente
          className="bg-[#00B5AD] text-white font-semibold py-2 px-5 rounded-full hover:opacity-90 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F4F6F8] rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
        {/* ... (cabeçalho da secção, sem alterações) ... */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl text-[#A0AEC0]">Encontre o seu próximo filme...</h2>
              <h1 className="text-5xl font-bold text-[#2D3748]">Top Filmes do Momento</h1>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3 mt-4 sm:mt-0">
              <Link to="/sua-lista" className="flex items-center gap-3 bg-[#00B5AD]/20 text-[#00B5AD] font-semibold py-2 px-4 rounded-full transition hover:bg-[#00B5AD]/30">
                <BsBookmark />
                <span>A Sua Lista</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SECÇÃO "TOP MOVIES" COM DADOS DA API E IMAGEM MAIOR */}
        {topMovies.length >= 2 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#FFFFFF] rounded-lg overflow-hidden flex items-center relative h-60">
              <div className="bg-[#00B5AD] h-full w-24 flex items-center justify-center">
                <span className="text-7xl font-extrabold text-white">{topMovies[0].rank}</span>
              </div>
              <img src={topMovies[0].image} alt={topMovies[0].title} className="w-2/5 h-full object-cover" />
              <div className="p-6 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-[#2D3748]">{topMovies[0].title}</h3>
                <StarRating rating={topMovies[0].rating} />
                <Link to={`/filme/${topMovies[0].id}`}>
                  <button className="mt-4 bg-[#00B5AD] text-white font-semibold py-2 px-5 rounded-full hover:opacity-90 transition self-start">VER MAIS</button>
                </Link>
              </div>
            </div>
            <div className="bg-[#FFFFFF] rounded-lg overflow-hidden flex items-center relative h-60">
              <span className="text-8xl font-extrabold text-gray-200/80 absolute -left-4 top-1/2 -translate-y-1/2 select-none z-0">{topMovies[1].rank}</span>
              <img src={topMovies[1].image} alt={topMovies[1].title} className="w-2/5 h-full object-cover relative z-10" />
              <div className="p-4 z-10 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-[#2D3748]">{topMovies[1].title}</h3>
                <StarRating rating={topMovies[1].rating} />
                <Link to={`/filme/${topMovies[1].id}`}>
                  <button className="mt-2 bg-[#00B5AD] text-white font-semibold py-2 px-5 rounded-full hover:opacity-90 transition self-start">VER MAIS</button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* SECÇÃO "TENDÊNCIAS" COM 8 FILMES */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Tendências Atuais</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingMovies.map(movie => (
              <Link to={`/filme/${movie.id}`} key={movie.id} className="relative rounded-lg overflow-hidden group shadow-lg bg-[#FFFFFF] aspect-[2/3]">
                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h4 className="font-bold text-lg">{movie.title}</h4>
                  <StarRating rating={movie.rating} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECÇÃO "CRÍTICAS" (mantida com dados estáticos) */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Críticas Recentes da Comunidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

