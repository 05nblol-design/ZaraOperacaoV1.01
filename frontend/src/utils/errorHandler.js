
// Error Handler para Auto-Login
export const handleAutoLoginError = (error) => {
  console.warn('Erro no auto-login:', error);
  
  // Limpar dados de autenticação inválidos
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  
  // Redirecionar para login se necessário
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    window.location.href = '/login';
  }
};

// Verificar se token é válido
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};
