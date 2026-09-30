
export function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Un compte avec cet email existe déjà',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
    'auth/network-request-failed': 'Erreur réseau, vérifiez votre connexion',
    'auth/invalid-credential': 'Identifiants invalides',
    'auth/invalid-verification-code': 'Code de vérification invalide',
    'auth/invalid-verification-id': 'ID de vérification invalide',
    'auth/code-expired': 'Le code a expiré',
    'auth/missing-verification-code': 'Code de vérification manquant',
  };

  return errorMessages[errorCode] || 'Une erreur est survenue, veuillez réessayer';
}
