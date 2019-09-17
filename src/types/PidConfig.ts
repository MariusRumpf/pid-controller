interface PidConfig {
  p: number,
  i: number,
  d: number,
  target: number,
  sampleTime: number,
  outputMin: number,
  outputMax: number,
  proportionalOnMeasurement?: boolean,
}

export default PidConfig;
