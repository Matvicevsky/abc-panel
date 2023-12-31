import { css, cx } from '@emotion/css';
import { css as cssCore, Global } from '@emotion/react';
import Slider from 'rc-slider';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import memoizeOne from 'memoize-one';

import { FieldConfigEditorProps, GrafanaTheme2, SliderFieldConfigSettings } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
// import { getStyles } from '@grafana/ui/src/components/Slider/styles';

import { NumberInput } from './NumberInput';

export function stylesFactory<ResultFn extends (this: any, ...newArgs: any[]) => ReturnType<ResultFn>>(
  stylesCreator: ResultFn
) {
  return memoizeOne(stylesCreator);
}

export const getStyles = stylesFactory((theme: GrafanaTheme2, isHorizontal: boolean, hasMarks = false) => {
  const { spacing } = theme;
  const railColor = theme.colors.border.strong;
  const trackColor = theme.colors.primary.main;
  const handleColor = theme.colors.primary.main;
  const blueOpacity = theme.colors.primary.transparent;
  const hoverStyle = `box-shadow: 0px 0px 0px 6px ${blueOpacity}`;

  return {
    container: css({
      width: '100%',
      margin: isHorizontal ? 'inherit' : spacing(1, 3, 1, 1),
      paddingBottom: isHorizontal && hasMarks ? theme.spacing(1) : 'inherit',
      height: isHorizontal ? 'auto' : '100%',
    }),
    // can't write this as an object since it needs to overwrite rc-slider styles
    // object syntax doesn't support kebab case keys
    slider: css`
      .rc-slider {
        display: flex;
        flex-grow: 1;
        margin-left: 7px; // half the size of the handle to align handle to the left on 0 value
      }
      .rc-slider-mark {
        top: ${theme.spacing(1.75)};
      }
      .rc-slider-mark-text {
        color: ${theme.colors.text.disabled};
        font-size: ${theme.typography.bodySmall.fontSize};
      }
      .rc-slider-mark-text-active {
        color: ${theme.colors.text.primary};
      }
      .rc-slider-handle {
        border: none;
        background-color: ${handleColor};
        box-shadow: ${theme.shadows.z1};
        cursor: pointer;
        opacity: 1;
      }

      .rc-slider-handle:hover,
      .rc-slider-handle:active,
      .rc-slider-handle-click-focused:focus {
        ${hoverStyle};
      }

      // The triple class names is needed because that's the specificity used in the source css :(
      .rc-slider-handle-dragging.rc-slider-handle-dragging.rc-slider-handle-dragging,
      .rc-slider-handle:focus-visible {
        box-shadow: 0 0 0 5px ${theme.colors.text.primary};
      }

      .rc-slider-dot,
      .rc-slider-dot-active {
        background-color: ${theme.colors.text.primary};
        border-color: ${theme.colors.text.primary};
      }

      .rc-slider-track {
        background-color: ${trackColor};
      }
      .rc-slider-rail {
        background-color: ${railColor};
        cursor: pointer;
      }
    `,
    /** Global component from @emotion/core doesn't accept computed classname string returned from css from emotion.
     * It accepts object containing the computed name and flattened styles returned from css from @emotion/core
     * */
    tooltip: cssCore`
      body {
        .rc-slider-tooltip {
          cursor: grab;
          user-select: none;
          z-index: ${theme.zIndex.tooltip};
        }

        .rc-slider-tooltip-inner {
          color: ${theme.colors.text.primary};
          background-color: transparent !important;
          border-radius: 0;
          box-shadow: none;
        }

        .rc-slider-tooltip-placement-top .rc-slider-tooltip-arrow {
          display: none;
        }

        .rc-slider-tooltip-placement-top {
          padding: 0;
        }
      }
    `,
    sliderInput: css({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    }),
    sliderInputVertical: css({
      flexDirection: 'column',
      height: '100%',

      '.rc-slider': {
        margin: 0,
        order: 2,
      },
    }),
    sliderInputField: css({
      marginLeft: theme.spacing(3),
      width: '60px',
      input: {
        textAlign: 'center',
      },
    }),
    sliderInputFieldVertical: css({
      margin: `0 0 ${theme.spacing(3)} 0`,
      order: 1,
    }),
  };
});

type Props = FieldConfigEditorProps<number, SliderFieldConfigSettings>;

export const SliderValueEditor = ({ value, onChange, item }: Props) => {
  // Input reference
  const inputRef = useRef<HTMLSpanElement>(null);

  // Settings
  const { settings } = item;
  const min = settings?.min || 0;
  const max = settings?.max || 100;
  const step = settings?.step;
  const marks = settings?.marks || { [min]: min, [max]: max };
  const included = settings?.included;
  const ariaLabelForHandle = settings?.ariaLabelForHandle;

  // Core slider specific parameters and state
  const inputWidthDefault = 75;
  const isHorizontal = true;
  const theme = useTheme2();
  const [sliderValue, setSliderValue] = useState<number>(value ?? min);
  const [inputWidth, setInputWidth] = useState<number>(inputWidthDefault);

  // Check for a difference between prop value and internal state
  useEffect(() => {
    if (value != null && value !== sliderValue) {
      setSliderValue(value);
    }
  }, [value, sliderValue]);

  // Using input font and expected maximum number of digits, set input width
  useEffect(() => {
    const inputElement = getComputedStyle(inputRef.current!);
    const fontWeight = inputElement.getPropertyValue('font-weight') || 'normal';
    const fontSize = inputElement.getPropertyValue('font-size') || '16px';
    const fontFamily = inputElement.getPropertyValue('font-family') || 'Arial';
    const wideNumericalCharacter = '0';
    const marginDigits = 4; // extra digits to account for things like negative, exponential, and controls
    const inputPadding = 8; // TODO: base this on input styling
    const maxDigits =
      Math.max((max + (step || 0)).toString().length, (max - (step || 0)).toString().length) + marginDigits;
    const refString = wideNumericalCharacter.repeat(maxDigits);
    const calculatedTextWidth = getTextWidth(refString, `${fontWeight} ${fontSize} ${fontFamily}`);
    if (calculatedTextWidth) {
      setInputWidth(calculatedTextWidth + inputPadding * 2);
    }
  }, [max, step]);

  const onSliderChange = useCallback(
    (v: number | number[]) => {
      const value = typeof v === 'number' ? v : v[0];
      setSliderValue(value);

      if (onChange) {
        onChange(value);
      }
    },
    [setSliderValue, onChange]
  );

  const onSliderInputChange = useCallback(
    (value?: number) => {
      let v = value;

      if (Number.isNaN(v) || !v) {
        v = 0;
      }

      setSliderValue(v);

      if (onChange) {
        onChange(v);
      }
    },
    [onChange]
  );

  // Styles
  const styles = getStyles(theme, isHorizontal, Boolean(marks));
  const stylesSlider = getStylesSlider(theme, inputWidth);
  const sliderInputClassNames = !isHorizontal ? [styles.sliderInputVertical] : [];

  return (
    <div className={cx(styles.container, styles.slider)}>
      {/** Slider tooltip's parent component is body and therefore we need Global component to do css overrides for it. */}
      <Global styles={styles.slider} />
      <label className={cx(styles.sliderInput, ...sliderInputClassNames)}>
        <Slider
          min={min}
          max={max}
          step={step}
          defaultValue={value}
          value={sliderValue}
          onChange={onSliderChange}
          vertical={!isHorizontal}
          reverse={false}
          ariaLabelForHandle={ariaLabelForHandle}
          marks={marks}
          included={included}
        />
        <span className={stylesSlider.numberInputWrapper} ref={inputRef}>
          <NumberInput value={sliderValue} onChange={onSliderInputChange} max={max} min={min} step={step} />
        </span>
      </label>
    </div>
  );
};

// Calculate width of string with given font
function getTextWidth(text: string, font: string): number | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return null;
}

const getStylesSlider = (theme: GrafanaTheme2, width: number) => {
  return {
    numberInputWrapper: css`
      margin-left: ${theme.spacing(3)};
      max-height: 32px;
      max-width: ${width}px;
      min-width: ${width}px;
      overflow: visible;
      width: 100%;
    `,
  };
};
