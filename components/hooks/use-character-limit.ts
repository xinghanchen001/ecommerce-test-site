import { useState, ChangeEvent } from 'react';

interface UseCharacterLimitProps {
  maxLength: number;
  initialValue?: string;
}

export function useCharacterLimit({
  maxLength,
  initialValue = '',
}: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);
  const characterCount = value.length;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  return {
    value,
    setValue,
    characterCount,
    handleChange,
    maxLength,
  };
}
