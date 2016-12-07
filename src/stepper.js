class StepDescriptor {
  /**
   * @param {Function} step - действие, которое будет выполнено при выполнении данного шага
   * @param {Stepper} stepper - инстанс класса Stepper, который осуществляет управление шагами
   * */
  constructor(step, stepper) {
    this.id = StepDescriptor.ID_COUNTER;
    StepDescriptor.ID_COUNTER++;

    this.stepper = stepper;
    this.action = step;
    this.execute = (data) => step(this, data);
  }

  id = 0;
  action;

  static ID_COUNTER = 0;

  next(data) {
    this.stepper.next(data, this);
  }

  remove() {
    this.stepper.remove(this);
  }

  reject(data) {
    this.stepper.reject(data);
  }
}

export class Stepper {
  /**
   * @param {Function[]} steps - массив шагов, которые будут обрабатываться
   * @param {Function} onReject - колбэк, который сработает при выбросом исключения одним из шагов
   * */
  constructor(steps, onReject = () => null) {
    steps.forEach((step) => this.add(step));
    this.reject = onReject;
  }

  steps = [];
  reject;

  currentStep = -1;

  next(data = null, stepDescriptor = null) {
    if (stepDescriptor) {
      this.currentStep = this.steps.findIndex((step) => step.id === stepDescriptor.id);
    }

    this.currentStep++;
    this.steps[this.currentStep].execute(data);

    return {
      done: this.currentStep === this.steps.length - 1
    }
  }

  prev() {
    this.currentStep--;
  }

  remove(stepDescriptor) {
    this.steps.splice(this.steps.findIndex((step) => step.id === stepDescriptor.id), 1);
  }

  add(step, index = null) {
    const stepDescriptor = new StepDescriptor(step, this);

    if (index == null) {
      this.steps.push(stepDescriptor);
    } else {
      this.steps.splice(index, 0, stepDescriptor);
    }

    return stepDescriptor;
  }

  insertBefort(stepDescriptor, step) {
    return this.add(step, this.steps.findIndex((step) => step.id === stepDescriptor.id) - 1);
  }

  insertAfter(stepDescriptor, step) {
    return this.add(step, this.steps.findIndex((step) => step.id === stepDescriptor.id) + 1);
  }

  sequence() {
    return sequence(this.steps.map(step => step.raw), this.reject);
  }
}

export function sequence(steps, reject) {
  let [last, ...firsts] = steps.slice().reverse();

  return (initialData) =>
    firsts.reduce((nextStep, step) =>
      (comingStep, data) =>
        step({
          next: (data) => nextStep(comingStep, data),
          reject: (data) => reject(data)
        }, data), last)(
      {
        reject: (data) => reject(data)
      }, initialData);
}
