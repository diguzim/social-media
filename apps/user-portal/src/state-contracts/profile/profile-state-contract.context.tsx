import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseProfileStateContract } from './profile-state.contract';
import { useProfileStatePresenter } from './presenters/hooks/use-profile-state.presenter';

const ProfileStateContractContext =
  createContext<UseProfileStateContract>(useProfileStatePresenter);

interface ProfileStateContractProviderProps {
  children: ReactNode;
  profileStateContract?: UseProfileStateContract;
}

export function ProfileStateContractProvider({
  children,
  profileStateContract = useProfileStatePresenter,
}: ProfileStateContractProviderProps) {
  return (
    <ProfileStateContractContext.Provider value={profileStateContract}>
      {children}
    </ProfileStateContractContext.Provider>
  );
}

export function useProfileStateContract() {
  const useContract = useContext(ProfileStateContractContext);
  return useContract();
}
