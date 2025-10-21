import { ComponentProps } from 'react';
import Image, { StaticImageData } from 'next/image';
import classNames from 'classnames';

import styles from './Textarea.module.scss';

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string;
  variant?: 'contained' | 'outlined';
  fullWidth?: boolean;
  icon?: StaticImageData;
  onIconClick?: () => void;
  id: string;
}

const c = 'textarea-component';

function Textarea({
  label,
  icon,
  variant = 'outlined',
  fullWidth = false,
  className,
  onIconClick,
  id,
  ...props
}: TextareaProps) {
  return (
    <div
      className={classNames(styles[c], className, styles[`${c}--${variant}`], {
        [styles['full-width']]: fullWidth
      })}
    >
      <div className={classNames(styles[`${c}__input-wrapper`])}>
        <textarea
          id={id}
          {...props}
          className={classNames(styles[`${c}__input`], styles[`${c}__input--${variant}`])}
        />
        {label && (
          <label htmlFor={id} className={styles[`${c}__label`]}>
            {label}
          </label>
        )}
        {icon && (
          <Image className={styles[`${c}__icon`]} src={icon} alt="icon" onClick={onIconClick} />
        )}
      </div>
    </div>
  );
}

export default Textarea;
