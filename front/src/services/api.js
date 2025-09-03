import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});


export const movieService = {
  getPopular: async () => {
    const response = await api.get('/movies/popular');
    
    return response.data.data;
  },

};

export default api;