import PidConfig from './types/PidConfig';
import { roundToDecimals } from './util';

export class PID {
  /**
   * Proportional value
   */
  private setKp: number;

  /**
   * Integral value
   */
  private setKi: number;

  /**
   * Derivative value
   */
  private setKd: number;

  /**
   * Interal proportional value
   */
  private kp: number;

  /**
   * Interal integral value
   */
  private ki: number;

  /**
   * Interal derivative value
   */
  private kd: number;

  /**
   * The target value for the pid controller
   */
  private target: number;

  /**
   * Rate at which update function is called and data is sampled
   */
  private sampleTime: number;

  /**
   * Minimum possible value for output
   */
  private outputMin: number;

  /**
   * Maximum possible value for output
   */
  private outputMax: number;

  /**
   * Last value written for output
   */
  private output = 0;

  /**
   * State for output sum used in calculation
   */
  private outputSum = 0;

  /**
   * Last received input value
   */
  private lastInput: number = null;

  /**
   * Calculate proportial on measurement or on error
   */
  private isProportialOnMeasurement = false;

  /**
   * Direction - Direct or Reverse
   */
  private isReverseDirectionEnabled = false;

  /**
   * Create a pid controller for the given settings
   * @param config
   */
  constructor({
    p, i, d, sampleTime, target, outputMin, outputMax, proportionalOnMeasurement = false,
  }: PidConfig) {
    this.sampleTime = sampleTime;
    this.setTunings(p, i, d);
    this.setOutputLimits(outputMin, outputMax);
    this.setTarget(target);

    this.isProportialOnMeasurement = proportionalOnMeasurement;
  }

  /**
   * Call this function in a regular interval of
   * the set sample time with the input value for
   * the pid, will return the output value to apply
   * @param input
   */
  public update(input: number): number {
    // Check for first call
    if (this.lastInput === null) {
      this.lastInput = input;
    }

    const error = this.target - input;
    const inputDelta = input - this.lastInput;

    this.outputSum += (this.ki * error);

    if (this.isProportialOnMeasurement) {
      this.outputSum -= this.kp * inputDelta;
    }

    this.outputSum = this.applyOutputLimits(this.outputSum);

    let output = 0;
    if (!this.isProportialOnMeasurement) { output = this.kp * error; }

    output += this.outputSum - this.kd * inputDelta;

    this.output = this.applyOutputLimits(Math.round(output));

    // Update state variables
    this.lastInput = input;

    return this.output;
  }

  /**
   * Set the target value for the pid
   * @param target
   */
  public setTarget(target: number): void {
    this.target = target;
  }

  /**
   * Set the minimum and maximum value possible
   * for the pid output (set corresponding to the pwn limits)
   */
  public setOutputLimits(min: number, max: number): void {
    if (min > max) {
      throw new Error('Minimum output limit cannot be bigger than maximum');
    }

    this.outputMin = min;
    this.outputMax = max;

    // Apply to current state
    this.output = this.applyOutputLimits(this.output);
    this.outputSum = this.applyOutputLimits(this.outputSum);
  }

  /**
   * Is the pid in reverse direction mode
   */
  public isInReverseDirection(): boolean {
    return this.isReverseDirectionEnabled;
  }

  /**
   * Enable reverse direction mode for controller
   * Disabled (Direct mode): +Output leads to +Input
   * Enabled (Reverse): +Output leads to -Input
   * @param enabled
   */
  public setReverseDirection(enabled: boolean): void {
    if (this.isReverseDirectionEnabled !== enabled) {
      this.kp = 0 - this.kp;
      this.ki = 0 - this.ki;
      this.kd = 0 - this.kd;
    }

    this.isReverseDirectionEnabled = enabled;
  }

  /**
   * Update the used pid tunings on the fly while operating
   * @param p
   * @param i
   * @param d
   */
  public setTunings(p: number, i: number, d: number): void {
    if (p < 0 || i < 0 || d < 0) {
      throw new Error('PID values cannot be below 0');
    }

    this.setKp = p;
    this.setKi = i;
    this.setKd = d;

    // Calculate internal pid representations
    const sampleTimeSec = roundToDecimals(this.sampleTime / 1000, 6);
    this.kp = p;
    this.ki = i * sampleTimeSec;
    this.kd = d / sampleTimeSec;

    if (this.isReverseDirectionEnabled) {
      this.kp = 0 - this.kp;
      this.ki = 0 - this.ki;
      this.kd = 0 - this.kd;
    }
  }

  /**
   * Set's the rate in milliseconds at which the pid calculation is called
   */
  public setSampleTime(sampleTime: number): void {
    if (sampleTime <= 0) {
      throw new Error('SampleTime has to be bigger than 0');
    }

    const ratio = sampleTime / this.sampleTime;
    this.ki *= ratio;
    this.kd /= ratio;

    this.sampleTime = sampleTime;
  }

  /**
   * Resets the internal values for the pid calculation,
   * should be called before a stopped update() interval
   * is restarted
   */
  public resetState(): void {
    this.outputSum = this.output;
    this.lastInput = null;
  }

  /**
   * Get the currently used configuration
   */
  public getConfig(): PidConfig {
    return {
      p: this.setKp,
      i: this.setKi,
      d: this.setKd,
      target: this.target,
      sampleTime: this.sampleTime,
      outputMin: this.outputMin,
      outputMax: this.outputMax,
    };
  }

  /**
   * Get the current target value
   */
  public getTarget(): number {
    return this.target;
  }

  /**
   * Applies the output limits to the given value
   * @param output
   */
  private applyOutputLimits(output: number): number {
    if (output > this.outputMax) { return this.outputMax; }
    if (output < this.outputMin) { return this.outputMin; }
    return output;
  }
}
