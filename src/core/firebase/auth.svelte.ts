import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from './client';

class AuthState {
  user = $state<User | null>(null);
  loading = $state(true);

  constructor() {
    onAuthStateChanged(
      auth,
      (u) => {
        this.user = u;
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
}

export const authState = new AuthState();
