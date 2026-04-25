/**
 * Firebase client SDK — inicialização e helpers.
 * Instalar dependências quando integrar:
 *   npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
 *
 * Por enquanto exporta stubs para não quebrar imports durante dev local.
 */

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

// ---------- Stubs (dev local) ----------

let _currentUser: FirebaseUser | null = null;

export const auth = {
  getCurrentUser(): FirebaseUser | null {
    return _currentUser;
  },

  async signInAnonymously(): Promise<FirebaseUser> {
    const user: FirebaseUser = {
      uid: `anon-${Date.now()}`,
      email: null,
      displayName: null,
      isAnonymous: true,
    };
    _currentUser = user;
    return user;
  },

  async signOut(): Promise<void> {
    _currentUser = null;
  },
};

export const firestore = {
  async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    // TODO: implementar com @react-native-firebase/firestore
    console.warn(`[firestore stub] getDocument(${collection}/${docId})`);
    return null;
  },

  async setDocument(collection: string, docId: string, data: object): Promise<void> {
    console.warn(`[firestore stub] setDocument(${collection}/${docId})`, data);
  },
};

/**
 * Sincroniza favoritos locais com Firestore.
 * Chamado após login bem-sucedido.
 */
export async function syncFavoritesToFirestore(
  userId: string,
  localFavorites: string[]
): Promise<void> {
  await firestore.setDocument('favorites', userId, { pairs: localFavorites });
}

/**
 * Busca favoritos do Firestore e mescla com locais.
 * Locais têm prioridade em caso de conflito.
 */
export async function mergeFavoritesFromFirestore(
  userId: string,
  localFavorites: string[]
): Promise<string[]> {
  const remote = await firestore.getDocument<{ pairs: string[] }>('favorites', userId);
  if (!remote) return localFavorites;
  const merged = Array.from(new Set([...localFavorites, ...(remote.pairs ?? [])]));
  return merged.slice(0, 10);
}
