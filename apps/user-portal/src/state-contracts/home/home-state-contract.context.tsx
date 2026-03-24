import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseHomeStateContract } from './home-state.contract';
import { useHomeStatePresenter } from './presenters/hooks/use-home-state.presenter';

const HomeStateContractHookContext = createContext<UseHomeStateContract>(useHomeStatePresenter);

interface StateContractsProviderProps {
  children: ReactNode;
  homeStateContract?: UseHomeStateContract;
}

export function StateContractsProvider({
  children,
  homeStateContract = useHomeStatePresenter,
}: StateContractsProviderProps) {
  return (
    <HomeStateContractHookContext.Provider value={homeStateContract}>
      {children}
    </HomeStateContractHookContext.Provider>
  );
}

export function useHomeStateContract() {
  const useContract = useContext(HomeStateContractHookContext);
  return useContract();
}
