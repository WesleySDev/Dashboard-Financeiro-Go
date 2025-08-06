import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste se seu backend estiver em outra porta
})

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(config => {
  const userData = localStorage.getItem('usuario')
  if (userData) {
    try {
      const parsedData = JSON.parse(userData)
      const token = parsedData.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Token adicionado:', `Bearer ${token}`)
      } else {
        console.log('Token não encontrado no objeto do usuário')
      }
    } catch (error) {
      console.error('Erro ao processar token:', error)
    }
  } else {
    console.log('Dados do usuário não encontrados no localStorage')
  }
  return config
})

export default api
