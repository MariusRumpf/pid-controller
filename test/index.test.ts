import PID from '../src/index';

test('PID construction', () => {
  const config = {
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 0, outputMin: 0, outputMax: 255,
  };
  const pid = new PID(config);
  expect(pid.getConfig()).toEqual(config);
});

test('PID update target value', () => {
  const pid = new PID({
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 0, outputMin: 0, outputMax: 255,
  });
  expect(pid.getTarget()).toBe(0);

  pid.setTarget(100);
  expect(pid.getTarget()).toBe(100);
});

test('PID update calls', () => {
  const pid = new PID({
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 255,
  });
  expect(pid.update(0)).toBe(100);
  expect(pid.update(0)).toBe(100);
});

test('PID set sample time', () => {
  const pid = new PID({
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 255,
  });
  expect(pid.getConfig().sampleTime).toBe(1000);

  pid.setSampleTime(100);
  expect(pid.getConfig().sampleTime).toBe(100);

  expect(() => { pid.setSampleTime(0); }).toThrow(Error);
  expect(() => { pid.setSampleTime(-100); }).toThrow(Error);
});

test('PID set tunings', () => {
  const pid = new PID({
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 100,
  });
  expect(pid.getConfig()).toMatchObject({ p: 1, i: 0, d: 0 });

  pid.setTunings(0.5, 0.25, 0.25);
  expect(pid.getConfig()).toMatchObject({ p: 0.5, i: 0.25, d: 0.25 });


  expect(() => { pid.setTunings(-0.1, 0.25, 0.25); }).toThrow(Error);
  expect(() => { pid.setTunings(1, -1, 0.25); }).toThrow(Error);
  expect(() => { pid.setTunings(1, 0, -0.25); }).toThrow(Error);
});

test('PID output limits', () => {
  const pid = new PID({
    p: 1, i: 0, d: 0, sampleTime: 1000, target: 100, outputMin: 0, outputMax: 100,
  });
  expect(pid.getConfig()).toMatchObject({ outputMin: 0, outputMax: 100 });

  pid.setOutputLimits(10, 200);
  expect(pid.getConfig()).toMatchObject({ outputMin: 10, outputMax: 200 });

  expect(() => { pid.setOutputLimits(100, 0); }).toThrow(Error);
});

test('PID proportional on measurement', () => {
  let pid = new PID({
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

  pid = new PID({
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
