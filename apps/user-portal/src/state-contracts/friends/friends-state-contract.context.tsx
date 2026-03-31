import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseFriendsStateContract } from './friends-state.contract';
import { useFriendsStatePresenter } from './presenters/hooks/use-friends-state.presenter';

const FriendsStateContractContext =
  createContext<UseFriendsStateContract>(useFriendsStatePresenter);

interface FriendsStateContractProviderProps {
  children: ReactNode;
  friendsStateContract?: UseFriendsStateContract;
}

export function FriendsStateContractProvider({
  children,
  friendsStateContract = useFriendsStatePresenter,
}: FriendsStateContractProviderProps) {
  return (
    <FriendsStateContractContext.Provider value={friendsStateContract}>
      {children}
    </FriendsStateContractContext.Provider>
  );
}

export function useFriendsStateContract() {
  const useContract = useContext(FriendsStateContractContext);
  return useContract();
}
