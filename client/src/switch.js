const useLocalUrl = false;

//const switch_url = 'http://localhost:3001';


const switch_url = useLocalUrl 
  ? 'https://trecenoticias-app-test-6d9a6dafed1f.herokuapp.com' 
  : 'https://trecenoticias-app-80268873ff71.herokuapp.com';


export default switch_url;

