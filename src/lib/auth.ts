export function authErrorMessage(error: { message?: string } | null): string {
  const message = error?.message ?? '';

  if (message.toLowerCase().includes('invalid login')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Confirma tu correo antes de entrar.';
  }
  if (message.toLowerCase().includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento.';
  }

  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}
