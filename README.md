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
