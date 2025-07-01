import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste se seu backend estiver em outra porta
})

export default api
