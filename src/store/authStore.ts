import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Company } from '@/types';

interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, companyName: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

// Sample users for demo
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@nexuscrm.com',
    role: 'admin',
    companyId: '1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'Sales Manager',
    email: 'manager@nexuscrm.com',
    role: 'sales_manager',
    companyId: '1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    name: 'Sales Representative',
    email: 'sales@nexuscrm.com',
    role: 'sales_rep',
    companyId: '1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sales',
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date(),
  },
];

const sampleCompany: Company = {
  id: '1',
  name: 'Nexus Technologies',
  plan: 'professional',
  createdAt: new Date('2024-01-01'),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = sampleUsers.find(u => u.email === email);
        if (user) {
          set({ 
            user: { ...user, lastLogin: new Date() }, 
            company: sampleCompany,
            isAuthenticated: true 
          });
          return true;
        }
        
        // For demo, accept any email with password "password"
        if (password === 'password') {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email,
            role: 'sales_rep',
            companyId: '1',
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          set({ 
            user: newUser, 
            company: sampleCompany,
            isAuthenticated: true 
          });
          return true;
        }
        
        return false;
      },

      signup: async (name: string, email: string, _password: string, companyName: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCompany: Company = {
          id: Math.random().toString(36).substr(2, 9),
          name: companyName,
          plan: 'starter',
          createdAt: new Date(),
        };
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: 'admin',
          companyId: newCompany.id,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        
        set({ 
          user: newUser, 
          company: newCompany,
          isAuthenticated: true 
        });
        return true;
      },

      logout: () => {
        set({ user: null, company: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      hasRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'nexuscrm-auth',
    }
  )
);
