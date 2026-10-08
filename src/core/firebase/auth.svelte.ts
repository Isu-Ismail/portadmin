import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from './client';

class AuthState {
  user = $state<User | null>(null);
  loading = $state(true);
  isKnownUser = $state(typeof localStorage !== 'undefined' && localStorage.getItem('portadmin_logged_in') === 'true');

  constructor() {
    onAuthStateChanged(
      auth,
      (u) => {
        this.user = u;
        this.loading = false;
        if (u) {
          localStorage.setItem('portadmin_logged_in', 'true');
          this.isKnownUser = true;
        } else {
          localStorage.removeItem('portadmin_logged_in');
          this.isKnownUser = false;
        }
      },
      () => {
        this.loading = false;
        this.isKnownUser = false;
        localStorage.removeItem('portadmin_logged_in');
      }
    );
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    localStorage.setItem('portadmin_logged_in', 'true');
    this.isKnownUser = true;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('portadmin_logged_in');
    this.isKnownUser = false;
    await signOut(auth);
  }
}

export const authState = new AuthState();
