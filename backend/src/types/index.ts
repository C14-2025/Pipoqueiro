export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  bio?: string;
  foto_perfil?: string;
  generos_favoritos?: string[];
  data_nascimento?: Date;
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
  data_nascimento?: Date;
}

export interface UsuarioLogin {
  email: string;
  senha: string;
}

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

export interface ListaQueroVer {
  id: number;
  usuario_id: number;
  tmdb_id: number;
  prioridade: 'baixa' | 'media' | 'alta';
  data_adicao: Date;
  notificar_lancamento: boolean;
  onde_assistir?: string;
}

export interface ListaQueroVerInput {
  tmdb_id: number;
  prioridade?: 'baixa' | 'media' | 'alta';
  notificar_lancamento?: boolean;
  onde_assistir?: string;
}

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