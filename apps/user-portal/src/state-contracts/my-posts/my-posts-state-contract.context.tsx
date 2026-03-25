import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseMyPostsStateContract } from './my-posts-state.contract';
import { useMyPostsStatePresenter } from './presenters/hooks/use-my-posts-state.presenter';

const MyPostsStateContractContext =
  createContext<UseMyPostsStateContract>(useMyPostsStatePresenter);

interface MyPostsStateContractProviderProps {
  children: ReactNode;
  myPostsStateContract?: UseMyPostsStateContract;
}

export function MyPostsStateContractProvider({
  children,
  myPostsStateContract = useMyPostsStatePresenter,
}: MyPostsStateContractProviderProps) {
  return (
    <MyPostsStateContractContext.Provider value={myPostsStateContract}>
      {children}
    </MyPostsStateContractContext.Provider>
  );
}

export function useMyPostsStateContract() {
  const useContract = useContext(MyPostsStateContractContext);
  return useContract();
}
