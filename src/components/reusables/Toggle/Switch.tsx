import React, { useState } from 'react';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

function Switch({ checked = false, onChange }: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const toggleSwitch = () => {
    setIsChecked(!isChecked);
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <div
      className={`${styles['switch']} ${isChecked ? styles['switch-checked'] : ''}`}
      onClick={toggleSwitch}
    >
      <div className={`${styles['slider']} ${isChecked ? styles['checked'] : ''}`} />
    </div>
  );
}

export default Switch;
