import { Input } from 'antd';
import { useState, useEffect } from 'react';

const StepInput = ({ value, onChange, ...props }) => {
    const [inputValue, setInputValue] = useState(value?.toString() || '');
  
    const handleChange = (e) => {
      const newValue = e.target.value;
      
      // Allow empty input, decimal point, and numbers
      if (newValue === '' || newValue === '.' || /^\d*\.?\d*$/.test(newValue)) {
        setInputValue(newValue);
        // Only call onChange with parsed float when we have a valid number
        if (newValue !== '' && newValue !== '.') {
          onChange(parseFloat(newValue));
        }
      }
    };
  
    // Update input value when prop changes externally
    useEffect(() => {
      setInputValue(value?.toString() || '');
    }, [value]);
  
    return (
      <Input
        {...props}
        size="small"
        className="parameter-input"
        placeholder="Step"
        value={inputValue}
        style={{ width: '80px' }}
        onChange={handleChange}
        onBlur={() => {
          // Clean up empty or invalid input on blur
          if (inputValue === '' || inputValue === '.') {
            setInputValue('0');
            onChange(0);
          }
        }}
      />
    );
  };

export default StepInput;
  