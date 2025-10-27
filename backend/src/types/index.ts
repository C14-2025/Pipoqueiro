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

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface AvaliacaoInput {
  tmdb_id: number;
  nota: number;
  titulo_review?: string;
  comentario?: string;
  spoiler?: boolean;
}
