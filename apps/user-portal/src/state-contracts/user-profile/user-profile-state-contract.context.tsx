import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseUserProfileStateContract } from './user-profile-state.contract';
import { useUserProfileStatePresenter } from './presenters/hooks/use-user-profile-state.presenter';

const UserProfileStateContractContext = createContext<UseUserProfileStateContract>(
  useUserProfileStatePresenter
);

interface UserProfileStateContractProviderProps {
  children: ReactNode;
  userProfileStateContract?: UseUserProfileStateContract;
}

export function UserProfileStateContractProvider({
  children,
  userProfileStateContract = useUserProfileStatePresenter,
}: UserProfileStateContractProviderProps) {
  return (
    <UserProfileStateContractContext.Provider value={userProfileStateContract}>
      {children}
    </UserProfileStateContractContext.Provider>
  );
}

export function useUserProfileStateContract() {
  const useContract = useContext(UserProfileStateContractContext);
  return useContract();
}
