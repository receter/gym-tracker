import { cn } from "@sys42/utils";
import { useState } from "react";

import styles from "./styles.module.css";

type InputQuantityProps = {
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  inputId?: string;
  value: number;
  onChangeInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeValue?: (value: number) => void;
};

export function InputQuantity({
  autoFocus,
  className,
  disabled,
  inputId,
  value,
  onChangeInput,
  onChangeValue,
}: InputQuantityProps) {
  const [intermediateValue, setIntermediateValue] = useState<string | null>(
    null,
  );

  function handleClickIncrease() {
    onChangeValue?.(value + 1);
  }

  function handleClickDecrease() {
    onChangeValue?.(value - 1);
  }

  function handleBlurInput() {
    if (intermediateValue !== null) {
      setIntermediateValue(null);
      onChangeValue?.(Number(intermediateValue));
    }
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    onChangeInput?.(e);
    const parsedValue = Number(e.target.value);
    if (parsedValue.toString() !== e.target.value) {
      setIntermediateValue(e.target.value);
    } else {
      setIntermediateValue(null);
      onChangeValue?.(parsedValue);
    }
  }

  return (
    <div className={cn(styles.inputQuantity, className)}>
      <button
        className={styles.button}
        aria-label="Decrease value"
        onClick={handleClickDecrease}
      >
        {svgIconMinus}
      </button>
      <input
        className={cn(
          styles.input,
          intermediateValue !== null && styles.input_intermediate,
        )}
        autoFocus={autoFocus}
        type="number"
        step={1}
        id={inputId}
        disabled={disabled}
        onBlur={handleBlurInput}
        value={intermediateValue ?? value}
        onChange={handleChangeInput}
      />
      <button
        className={styles.button}
        aria-label="Increase value"
        onClick={handleClickIncrease}
      >
        {svgIconPlus}
      </button>
    </div>
  );
}

const svgIconPlus = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

const svgIconMinus = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);
