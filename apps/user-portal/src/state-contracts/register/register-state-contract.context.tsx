import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseRegisterStateContract } from './register-state.contract';
import { useRegisterStatePresenter } from './presenters/hooks/use-register-state.presenter';

const RegisterStateContractContext =
  createContext<UseRegisterStateContract>(useRegisterStatePresenter);

interface RegisterStateContractProviderProps {
  children: ReactNode;
  registerStateContract?: UseRegisterStateContract;
}

export function RegisterStateContractProvider({
  children,
  registerStateContract = useRegisterStatePresenter,
}: RegisterStateContractProviderProps) {
  return (
    <RegisterStateContractContext.Provider value={registerStateContract}>
      {children}
    </RegisterStateContractContext.Provider>
  );
}

export function useRegisterStateContract() {
  const useContract = useContext(RegisterStateContractContext);
  return useContract();
}
