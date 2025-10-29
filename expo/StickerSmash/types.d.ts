interface CounterType {
  value: number
  max?: number
  history: number[]
}

interface TimerType {
  counter: CounterType
  prev: number
  crr: number
  key: number | null
}

interface AMRAPConfigType {
  time: number
  counter: CounterType
}

interface RestConfigType {
  time: number
  actual?: number
}

interface WaitConfigType {
  time: number
  actual?: number
}

interface EMOMConfigType {
  time: number
  counter: CounterType
  times: number
}

type AMRAPStepType = {
  type: "AMRAP"
  config: AMRAPConfigType
}

type RestStepType = {
  type: "Rest"
  config: RestConfigType
}

type WaitStepType = {
  type: "Wait"
  config: WaitConfigType
}

type EMOMStepType = {
  type: "EMOM"
  config: EMOMConfigType
}

type StepType = AMRAPStepType | RestStepType | WaitStepType | EMOMStepType