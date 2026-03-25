import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseLoginStateContract } from './login-state.contract';
import { useLoginStatePresenter } from './presenters/hooks/use-login-state.presenter';

const LoginStateContractContext = createContext<UseLoginStateContract>(useLoginStatePresenter);

interface LoginStateContractProviderProps {
  children: ReactNode;
  loginStateContract?: UseLoginStateContract;
}

export function LoginStateContractProvider({
  children,
  loginStateContract = useLoginStatePresenter,
}: LoginStateContractProviderProps) {
  return (
    <LoginStateContractContext.Provider value={loginStateContract}>
      {children}
    </LoginStateContractContext.Provider>
  );
}

export function useLoginStateContract() {
  const useContract = useContext(LoginStateContractContext);
  return useContract();
}
