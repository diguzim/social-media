import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, type RegisterRequest } from '../../../../services/auth';
import type { RegisterStateContract } from '../../register-state.contract';

const DEFAULT_FORM_DATA: RegisterRequest = {
  name: '',
  username: '',
  email: '',
  password: '',
};

export function useRegisterStatePresenter(): RegisterStateContract {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>(DEFAULT_FORM_DATA);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = useMemo(
    () =>
      formData.name.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '',
    [formData]
  );

  const updateField = (field: keyof RegisterRequest, value: string) => {
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
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
