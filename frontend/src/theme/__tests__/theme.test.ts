import { describe, it, expect } from 'vitest';
import { lightTheme, darkTheme, gradients } from '../index';

describe('Theme Configuration', () => {
  it('lightTheme should have light palette mode', () => {
    expect(lightTheme.palette.mode).toBe('light');
  });

  it('darkTheme should have dark palette mode', () => {
    expect(darkTheme.palette.mode).toBe('dark');
  });

  it('both themes should have correct primary color', () => {
    expect(lightTheme.palette.primary.main).toBe('#5C6BC0');
    expect(darkTheme.palette.primary.main).toBe('#7986CB');
  });

  it('both themes should have secondary color', () => {
    expect(lightTheme.palette.secondary.main).toBe('#00897B');
    expect(darkTheme.palette.secondary.main).toBe('#00897B');
  });

  it('gradients object should have all expected keys', () => {
    expect(gradients).toHaveProperty('primary');
    expect(gradients).toHaveProperty('secondary');
    expect(gradients).toHaveProperty('revenue');
    expect(gradients).toHaveProperty('expense');
    expect(gradients).toHaveProperty('warning');
    expect(gradients).toHaveProperty('info');
    expect(gradients).toHaveProperty('purple');
    expect(gradients).toHaveProperty('card');
  });

  it('gradients.card should be a function', () => {
    expect(typeof gradients.card).toBe('function');
    const result = gradients.card('#ff0000');
    expect(result).toContain('linear-gradient');
  });

  it('typography should use Inter font family', () => {
    expect(lightTheme.typography.fontFamily).toContain('Inter');
    expect(darkTheme.typography.fontFamily).toContain('Inter');
  });

  it('shape borderRadius should be 12', () => {
    expect(lightTheme.shape.borderRadius).toBe(12);
    expect(darkTheme.shape.borderRadius).toBe(12);
  });

  it('light theme background colors should be correct', () => {
    expect(lightTheme.palette.background.default).toBe('#F0F2F8');
    expect(lightTheme.palette.background.paper).toBe('#FFFFFF');
  });

  it('dark theme background colors should be correct', () => {
    expect(darkTheme.palette.background.default).toBe('#0F1123');
    expect(darkTheme.palette.background.paper).toBe('#1A1D35');
  });

  it('both themes should have button textTransform set to none', () => {
    expect(lightTheme.typography.button.textTransform).toBe('none');
    expect(darkTheme.typography.button.textTransform).toBe('none');
  });
});
