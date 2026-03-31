import type { ComponentType, ReactNode } from 'react';
import { StateContractsProvider } from '../home';
import { RegisterStateContractProvider } from '../register';
import { LoginStateContractProvider } from '../login';
import { MyPostsStateContractProvider } from '../my-posts';
import { ProfileStateContractProvider } from '../profile';
import { UserProfileStateContractProvider } from '../user-profile';
import { FriendsStateContractProvider } from '../friends';

type ProviderComponent = ComponentType<{ children: ReactNode }>;

const STATE_CONTRACT_PROVIDERS: ProviderComponent[] = [
  StateContractsProvider,
  RegisterStateContractProvider,
  LoginStateContractProvider,
  MyPostsStateContractProvider,
  ProfileStateContractProvider,
  UserProfileStateContractProvider,
  FriendsStateContractProvider,
];

interface AppStateContractsProviderProps {
  children: ReactNode;
}

export function AppStateContractsProvider({ children }: AppStateContractsProviderProps) {
  return STATE_CONTRACT_PROVIDERS.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
}
