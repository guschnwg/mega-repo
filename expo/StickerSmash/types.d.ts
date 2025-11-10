interface CounterType {
  value: number;
  max?: number;
  history: number[];
}

interface TimerType {
  counter: CounterType;
  prev: number;
  crr: number;
  key: number | null;
}

interface AMRAPConfigType {
  time: number;
  counter: CounterType;
}

interface RestConfigType {
  time: number;
  actual?: number;
}

interface WaitConfigType {
  time: number;
  actual?: number;
}

interface EMOMConfigType {
  time: number;
  counter: CounterType;
  times: number;
}

interface SetConfigType {
  counters: CounterType[];
  waits: number[];
}

enum StepTypesEnum {
  AMRAP = "AMRAP",
  Rest = "Rest",
  Wait = "Wait",
  EMOM = "EMOM",
  Set = "Set",
}

type AMRAPStepType = {
  type: StepTypesEnum.AMRAP;
  config: AMRAPConfigType;
};

type RestStepType = {
  type: StepTypesEnum.Rest;
  config: RestConfigType;
};

type WaitStepType = {
  type: StepTypesEnum.Wait;
  config: WaitConfigType;
};

type EMOMStepType = {
  type: StepTypesEnum.EMOM;
  config: EMOMConfigType;
};

type SetStepType = {
  type: StepTypesEnum.Set;
  config: SetConfigType;
};

type StepType =
  | AMRAPStepType
  | RestStepType
  | WaitStepType
  | EMOMStepType
  | SetStepType;
