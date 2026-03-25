import type { LoginRequest } from '../../services/auth';

export interface LoginState {
  formData: LoginRequest;
  error: string;
  isLoading: boolean;
  isFormValid: boolean;
}

export interface LoginStateActions {
  updateField: (field: keyof LoginRequest, value: string) => void;
  submit: () => Promise<void>;
}

export interface LoginStateContract {
  state: LoginState;
  actions: LoginStateActions;
}

export type UseLoginStateContract = () => LoginStateContract;
