import type { RegisterRequest } from '../../services/auth';

export interface RegisterState {
  formData: RegisterRequest;
  error: string;
  isLoading: boolean;
  isFormValid: boolean;
}

export interface RegisterStateActions {
  updateField: (field: keyof RegisterRequest, value: string) => void;
  submit: () => Promise<void>;
}

export interface RegisterStateContract {
  state: RegisterState;
  actions: RegisterStateActions;
}

export type UseRegisterStateContract = () => RegisterStateContract;
