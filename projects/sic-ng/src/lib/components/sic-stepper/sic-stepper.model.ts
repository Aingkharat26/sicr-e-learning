export interface SicStepperStep {
  label: string;
  description?: string;
  /** Shows the built-in "Skip" nav button while this step is active. */
  optional?: boolean;
  /** Prevents jumping to this step by clicking its indicator. */
  disabled?: boolean;
}
