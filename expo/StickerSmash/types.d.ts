interface CounterType {
  value: number
  history: number[]
}

interface TimerType {
  counter: CounterType
  prev: number
  crr: number
  key: number | null
}

interface StepType {
  type: 'AMRAP' | 'Rest' | 'Wait'
  startTime?: number
  endTime: number
  counter: CounterType
}