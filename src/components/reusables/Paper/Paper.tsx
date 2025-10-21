import { ComponentProps, PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Paper.module.scss';

const c = 'paper-component';

interface PaperProps extends ComponentProps<'div'> {
  className?: string;
}

function Paper({ className, children, ...props }: PropsWithChildren<PaperProps>) {
  return (
    <div {...props} className={classNames(styles[c], className)}>
      {children}
    </div>
  );
}

export default Paper;
