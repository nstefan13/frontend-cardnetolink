import { ComponentProps, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import classNames from 'classnames';

import PasswordVisibleIcon from 'public/svgs/password-visible.svg';
import PasswordHiddenIcon from 'public/svgs/password-hidden.svg';

import styles from './Input.module.scss';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  variant?: 'contained' | 'outlined';
  fullWidth?: boolean;
  icon?: StaticImageData;
  onIconClick?: () => void;
  id: string;
  error?: boolean;
}

const c = 'input-component';

function Input({
  label,
  type,
  icon,
  variant = 'outlined',
  fullWidth = false,
  className,
  onIconClick,
  id,
  error = false,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div
      className={classNames(styles[c], className, styles[`${c}--${variant}`], {
        [styles['full-width']]: fullWidth,
        [styles[`${c}--error`]]: error
      })}
    >
      <div className={classNames(styles[`${c}__input-wrapper`])}>
        <input
          id={id}
          {...props}
          placeholder=" "
          type={type === 'password' && isPasswordVisible ? 'text' : type}
          className={classNames(styles[`${c}__input`], styles[`${c}__input--${variant}`])}
        />
        {label && (
          <label htmlFor={id} className={styles[`${c}__label`]}>
            {label}
          </label>
        )}
      </div>
      {type === 'password' ? (
        isPasswordVisible ? (
          <Image
            className={styles[`${c}__icon`]}
            src={PasswordVisibleIcon}
            alt="icon"
            onClick={() => setIsPasswordVisible(false)}
          />
        ) : (
          <Image
            className={styles[`${c}__icon`]}
            src={PasswordHiddenIcon}
            alt="icon"
            onClick={() => setIsPasswordVisible(true)}
          />
        )
      ) : (
        icon && (
          <Image className={styles[`${c}__icon`]} src={icon} alt="icon" onClick={onIconClick} />
        )
      )}
    </div>
  );
}

export default Input;
