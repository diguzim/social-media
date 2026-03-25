import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProfile,
  getUserProfile,
  loginUser,
  type LoginRequest,
} from '../../../../services/auth';
import type { LoginStateContract } from '../../login-state.contract';

const DEFAULT_FORM_DATA: LoginRequest = {
  email: '',
  password: '',
};

export function useLoginStatePresenter(): LoginStateContract {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>(DEFAULT_FORM_DATA);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = useMemo(
    () => formData.email.trim() !== '' && formData.password.trim() !== '',
    [formData]
  );

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async () => {
    if (isLoading || !isFormValid) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await loginUser(formData);

      try {
        await getProfile();
      } catch {
        const cachedUser = getUserProfile();
        if (!cachedUser) {
          localStorage.removeItem('jwtToken');
          throw new Error('Failed to load user profile after login');
        }
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: {
      formData,
      error,
      isLoading,
      isFormValid,
    },
    actions: {
      updateField,
      submit,
    },
  };
}
