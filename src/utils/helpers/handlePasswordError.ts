import { AxiosError } from 'axios';

export function handlePasswordError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 429) {
      return 'Trop de tentatives. Réessayez dans 15 minutes, ou recevez un code par e-mail.';
    }
    if (error.response?.status === 401) {
      return 'Email ou mot de passe incorrect.';
    }
  }
  return "Une erreur s'est produite lors de la connexion. Veuillez réessayer plus tard.";
}
