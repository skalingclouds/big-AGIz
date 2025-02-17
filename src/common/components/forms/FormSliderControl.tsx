import * as React from 'react';

import { FormControl, Slider } from '@mui/joy';

import { FormLabelStart } from './FormLabelStart';


/**
 * Slider Control
 */
export function FormSliderControl(props: {
  title: string | React.JSX.Element, description?: string | React.JSX.Element, ariaLabel?: string,
  disabled?: boolean,
  min?: number, max?: number, step?: number, defaultValue?: number,
  valueLabelDisplay?: 'on' | 'auto' | 'off',
  value: number | null, onChange: (value: number) => void,
  endAdornment?: React.ReactNode,
}) {
  return (
    <FormControl disabled={props.disabled} orientation='horizontal' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <FormLabelStart title={props.title} description={props.description} />
      <Slider
        aria-label={props.ariaLabel} color='neutral'
        disabled={props.disabled}
        min={props.min} max={props.max} step={props.step} defaultValue={props.defaultValue}
        value={props.value === null ? undefined : props.value} onChange={(_event, value) => props.onChange(value as number)}
        valueLabelDisplay={props.valueLabelDisplay}
        // sx={{ py: 1, mt: 1.1 }}
      />
      {props.endAdornment}
    </FormControl>
  );
}