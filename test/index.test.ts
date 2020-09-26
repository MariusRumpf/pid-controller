import { PIDController } from '../src/index';

describe('pid controller', () => {
  it('constructs', () => {
    expect.assertions(1);
    const config = {
      p: 1, i: 0, d: 0, sampleTime: 1000, target: 0, outputMin: 0, outputMax: 255,
    };
    const pid = new PIDController(config);
    expect(pid.getConfig()).toStrictEqual(config);
  });

  it('handles setTarget calls', () => {
    expect.assertions(2);
    const pid = new PIDController({
      p: 1, i: 0, d: 0, sampleTime: 1000, target: 0, outputMin: 0, outputMax: 255,
    });
    expect(pid.getTarget()).toBe(0);

    pid.setTarget(100);
    expect(pid.getTarget()).toBe(100);
  });

  it('handles setSampleTime calls', () => {
    expect.assertions(5);
    const pid = new PIDController({
      p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 255,
    });
    expect(pid.getConfig().sampleTime).toBe(1000);

    pid.setSampleTime(100);
    expect(pid.getConfig().sampleTime).toBe(100);

    expect(() => { pid.setSampleTime(0); }).toThrow(Error);
    expect(() => { pid.setSampleTime(-100); }).toThrow(Error);

    pid.setSampleTime(100.3456789);
    expect(pid.getConfig().sampleTime).toBe(100.3456789);
  });

  it('handles setTunings calls', () => {
    expect.assertions(5);
    const pid = new PIDController({
      p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 100,
    });
    expect(pid.getConfig()).toMatchObject({ p: 1, i: 0, d: 0 });

    pid.setTunings(0.5, 0.25, 0.25);
    expect(pid.getConfig()).toMatchObject({ p: 0.5, i: 0.25, d: 0.25 });

    expect(() => { pid.setTunings(-0.1, 0.25, 0.25); }).toThrow(Error);
    expect(() => { pid.setTunings(1, -1, 0.25); }).toThrow(Error);
    expect(() => { pid.setTunings(1, 0, -0.25); }).toThrow(Error);
  });

  it('handles setOutputLimits calls', () => {
    expect.assertions(3);
    const pid = new PIDController({
      p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 100,
    });
    expect(pid.getConfig()).toMatchObject({ outputMin: 0, outputMax: 100 });

    pid.setOutputLimits(10, 200);
    expect(pid.getConfig()).toMatchObject({ outputMin: 10, outputMax: 200 });

    expect(() => { pid.setOutputLimits(100, 0); }).toThrow(Error);
  });

  it('handles proportionalOnMeasurement option', () => {
    expect.assertions(4);
    let pid = new PIDController({
      p: 1,
      i: 0,
      d: 0,
      sampleTime: 1000,
      target: 100,
      outputMin: 0,
      outputMax: 100,
      proportionalOnMeasurement: true,
    });

    expect(pid.update(0)).toBe(0);
    expect(pid.update(0)).toBe(0);

    pid = new PIDController({
      p: 0,
      i: 1,
      d: 0,
      sampleTime: 1000,
      target: 100,
      outputMin: 0,
      outputMax: 100,
      proportionalOnMeasurement: true,
    });

    expect(pid.update(0)).toBe(100);
    expect(pid.update(0)).toBe(100);
  });

  it('handles proportional part of update call', () => {
    expect.assertions(2);
    const pid = new PIDController({
      p: 2, i: 0, d: 0, sampleTime: 1000, target: 10, outputMin: -255, outputMax: 100,
    });
    expect(pid.update(0)).toBe(20);

    pid.setOutputLimits(0, 10);
    expect(pid.update(0)).toBe(10);
  });

  it('handles derivative part of update call', () => {
    expect.assertions(2);
    const pid = new PIDController({
      p: 0, i: 0, d: 2, sampleTime: 1000, target: 10, outputMin: -255, outputMax: 100,
    });

    expect(pid.update(0)).toBe(0); // Expect nothing on first call
    expect(pid.update(5)).toBe(-10); // Derivative on second call
  });

  it('handles integral part of update call', () => {
    expect.assertions(3);
    const pid = new PIDController({
      p: 0, i: 2, d: 0, sampleTime: 1000, target: 10, outputMin: -255, outputMax: 100,
    });

    expect(pid.update(0)).toBe(20);
    expect(pid.update(0)).toBe(40);
    expect(pid.update(5)).toBe(50);
  });

  it('handles negativ integral part of update call', () => {
    expect.assertions(2);
    const pid = new PIDController({
      p: 0, i: 2, d: 0, sampleTime: 1000, target: -10, outputMin: -255, outputMax: 100,
    });

    expect(pid.update(0)).toBe(-20);
    expect(pid.update(0)).toBe(-40);
  });

  it('calculates output with multiple updates', () => {
    expect.assertions(4);
    const pid = new PIDController({
      p: 1, i: 0.1, d: 1, sampleTime: 1000, target: 10, outputMin: -255, outputMax: 100,
    });

    expect(pid.update(0)).toBe(11);
    expect(pid.update(5)).toBe(1.5);
    expect(pid.update(11)).toBe(-5.6);
    expect(pid.update(10)).toBe(2.4);
  });
});
