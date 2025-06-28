// Cambiar a true si estás trabajando en localhost
const useLocalUrl = false;

const switch_url = useLocalUrl 
  ? 'http://localhost:3001' 
  : 'https://gestor-noticias-api.onrender.com';

export default switch_url;


