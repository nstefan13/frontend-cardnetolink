import { ComponentProps } from 'react';
import ReactSelect, { StylesConfig } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

type SelectProps = ComponentProps<typeof ReactSelect> & {
  error?: boolean;
};

function Select({ error = false, ...props }: SelectProps) {
  const customStyles: StylesConfig = {
    control: (provided) => ({
      ...provided,
      height: 45,
      border: error ? '1px solid #dc3545' : '1px solid #C6C2C2',
      borderRadius: '6px',
      fontSize: 13,
      '&:hover': {
        border: error ? '1px solid #dc3545' : '1px solid #C6C2C2'
      }
    }),
    singleValue: (provided) => ({ ...provided, textOverflow: 'clip' }),
    indicatorSeparator: () => ({ width: 0 }),
    dropdownIndicator: (provided) => ({ ...provided, padding: '0 !important' }),
    menu: (provided) => ({
      ...provided,
      margin: 0,
      width: 140,
      borderRadius: 6,
      border: '1px solid #C6C2C2',
      padding: '6px 0px',
      zIndex: 2
    }),
    option: (provided, props) => ({
      ...provided,
      height: 45,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        backgroundColor: '#1D61DF',
        color: '#FFFFFF'
      },
      backgroundColor: props.isSelected ? '#1D61DF' : '#FFFFFF'
    })
  };

  return <ReactSelect styles={customStyles} isSearchable={false} {...props} />;
}

export default Select;
