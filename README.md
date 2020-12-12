# PID Controller

> PID Controller written in Node.js.

## Install

```
$ npm install @mariusrumpf/pid-controller
```

## Usage

```js
const { PIDController } = require('@mariusrumpf/pid-controller');

const controller = new PIDController({
  p: 1, i: 0, d: 0,
  target: 0,
  sampleTime: 1000, // in ms
  outputMin: 0,
  outputMax: 1000,
});

const correction = controller.update(10);
```

## API

### `update(value: number): number`

Call this function in a regular interval of
the set sample time with the input value for
the pid, will return the output value to apply.

### `setTarget(target:number)`

Set a new target value for the pid.

### `setOutputLimits(min: number, max: number)`

Set the minimum and maximum value possible
for the pid output.

### `setTunings(p: number, i: number, d: number)`

Update the used pid tunings on the fly while operating.

### `setSampleTime(sampleTime: number)`

Set the rate in milliseconds at which the pid update
calculation is called
