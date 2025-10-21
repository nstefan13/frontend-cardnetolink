import { ComponentProps, PropsWithChildren } from 'react';
import Image, { StaticImageData } from 'next/image';
import classNames from 'classnames';

import styles from './Button.module.scss';

interface ButtonProps extends ComponentProps<'div'> {
  text?: string;
  icon?: StaticImageData;
  variant?: 'contained' | 'text' | 'underline' | 'error' | 'plain';
  fullWidth?: boolean;
  disabled?: boolean;
}

const c = 'button-component';

function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    text,
    children,
    disabled = false,
    variant = 'contained',
    fullWidth = false,
    icon,
    className,
    ...rest
  } = props;

  return (
    <div
      {...rest}
      className={classNames(styles[c], className, styles[`${c}--${variant}`], {
        [styles[`${c}--full-width`]]: fullWidth,
        [styles[`${c}--disabled`]]: disabled
      })}
    >
      {text ?? children}
      {icon && <Image height={20} src={icon} alt="icon" />}
    </div>
  );
}

export default Button;
