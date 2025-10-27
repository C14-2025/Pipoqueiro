// ============================================================================
// LISTAS (Favoritos e Watchlist)
// ============================================================================

export interface ListItem {
  tmdb_id: number;
  data_adicao: string;
}

export interface AddToListInput {
  tmdb_id: number;
}

export type FavoritoItem = ListItem;
export type ListaQueroVerItem = ListItem;
export type AddFavoritoInput = AddToListInput;
export type AddListaQueroVerInput = AddToListInput;

// ============================================================================
// USUÁRIOS
// ============================================================================

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  bio?: string;
  foto_perfil?: string;
  generos_favoritos?: string[];
  data_nascimento?: string;
  favoritos: FavoritoItem[];
  lista_quero_ver: ListaQueroVerItem[];
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioInput {
  nome: string;
  email: string;
  senha: string;
  bio?: string;
  foto_perfil?: string;
  generos_favoritos?: string[];
  data_nascimento?: string;
}

export interface UsuarioLogin {
  email: string;
  senha: string;
}

// ============================================================================
// AVALIAÇÕES
// ============================================================================

export interface Avaliacao {
  id: number;
  usuario_id: number;
  tmdb_id: number;
  nota: number;
  titulo_review?: string;
  comentario?: string;
  spoiler: boolean;
  curtidas: number;
  created_at: Date;
  updated_at: Date;
}

export interface AvaliacaoInput {
  tmdb_id: number;
  nota: number;
  titulo_review?: string;
  comentario?: string;
  spoiler?: boolean;
}

// ============================================================================
// AUTENTICAÇÃO E API
// ============================================================================

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
