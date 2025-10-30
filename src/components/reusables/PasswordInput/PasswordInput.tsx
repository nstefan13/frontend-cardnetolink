'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import Input from '@/components/reusables/Input/Input';
import styles from './PasswordInput.module.scss';

const c = 'password-input';

interface PasswordSuggestion {
  comment: string;
  password: string;
}

function generatePassword(useSpecialChars: boolean = false): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const max_length = 12;
  
  function getRandomChar() {
    const arr = new Uint32Array(1); 
    crypto.getRandomValues(arr);
    return charset[arr[0] % charset.length];
  }
  
  let password = "";
  for (let i = 0; i < max_length; i++)
    password += getRandomChar();

  if (useSpecialChars) {
    let chars = password.split("");
    for (let i = 4; i <= max_length - 1; i += 4) {
      chars[i - 1] = '-';
    }
    password = chars.join("");
  }
  
  return password;
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  variant?: 'contained' | 'outlined';
  autoComplete?: string;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  fullWidth = false,
  variant = 'outlined',
  autoComplete = 'new-password',
}: PasswordInputProps) {
  const [suggestions, setSuggestions] = useState<PasswordSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateSuggestions = useCallback(() => {
    return [
      {
        comment: 'Strong password',
        password: generatePassword(true),
      },
      {
        comment: 'Without special characters',
        password: generatePassword(false),
      },
    ];
  }, []);

  // Show suggestions when focused and empty, hide when user starts typing
  useEffect(() => {
    if (isFocused && value === '' && !showSuggestions) {
      setSuggestions(generateSuggestions());
      setShowSuggestions(true);
    } else if (isFocused && value !== '' && showSuggestions) {
      setShowSuggestions(false);
    } else if (isFocused && value === '' && showSuggestions && suggestions.length === 0) {
      setSuggestions(generateSuggestions());
    }
  }, [isFocused, value, showSuggestions, suggestions.length, generateSuggestions]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (selectedPassword: string | null) => {
    if (!selectedPassword) return;
    setShowSuggestions(false);
    onChange(selectedPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles[`${c}`]}>
      <Combobox value={value} onChange={handleSuggestionSelect}>
        <div className={styles[`${c}__combobox-wrapper`]}>
          <ComboboxInput
            as={Input}
            ref={inputRef}
            id={id}
            type="password"
            label={label}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            fullWidth={fullWidth}
            variant={variant}
            autoComplete={autoComplete}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <ComboboxOptions 
              className={styles[`${c}__suggestions`]}
              static
            >
              {suggestions.map((suggestion, index) => (
                <ComboboxOption
                  key={index}
                  value={suggestion.password}
                  className={styles[`${c}__suggestion-option`]}
                >
                    <div className={styles[`${c}__suggestion-content`]}>
                        <span className={styles[`${c}__suggestion-comment`]}>{suggestion.comment}</span>
                        <span className={styles[`${c}__suggestion-password`]}>{suggestion.password}</span>
                    </div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  );
}