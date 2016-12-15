import test from 'ava';

import {Stepper, sequence} from './src/stepper';

class Counter {
  val = 0;

  add() {
    this.val++;
  }

  get() {
    return this.val;
  }

  reset() {
    this.val = 0;
  }
}

function createSteps(count, passedStepsCounter, descriptors = []) {
  return (new Array(count)).fill(null).map((itm, index) => (step, data, done) => {
    if (index - 1 === data ? 1 : 0) {
      passedStepsCounter.add();
    }

    descriptors[index] = step;

    step[done ? 'reject' : 'next'](index);
  });
}

function createWrappedSteps(count) {
  let reject = {
      state: false,
      cb: () => reject.state = true
    },
    descriptors = [],
    passedSteps = new Counter(),
    steps = createSteps(count, passedSteps, descriptors);

  return {startValue: -1, reject, descriptors, passedSteps, steps, count};
}


function createSequenceAndRun(count) {
  let testObj = createWrappedSteps(count);

  sequence(testObj.steps, testObj.reject.cb)(testObj.startValue);

  return testObj;
}

function createStepperAndRun(count) {
  let testObj = createWrappedSteps(count),
    stepper = new Stepper(testObj.steps, testObj.reject.cb);

  stepper.next(testObj.startValue);

  return testObj;
}

function checkValidEnding(factory, validator) {
  let stepsCount = 10, testObj = factory(stepsCount);

  if (testObj.reject.state && testObj.passedSteps.get() === stepsCount) {
    validator.pass();
  } else {
    validator.fail(`
    reject on last step (it must be a true): ${testObj.reject.state}
    steps count: ${stepsCount}
    steps passed: ${testObj.passedSteps.get()}
    `);
  }

  validator.end();
}

function testShiftedValidEnding(factory, title) {
  let stepsCount = 10, testObj = factory(stepsCount);

  for (let shift = stepsCount; shift--;) {
    test.cb(`create ${title} and random executing from ${shift} to end`, (t) => {
      testObj.reject.state = false;
      testObj.passedSteps.reset();

      if (shift < stepsCount - 1) {
        testObj.descriptors[shift].next(shift);
      } else {
        testObj.descriptors[shift].reject(shift);
      }

      if (testObj.reject.state && testObj.passedSteps.get() === stepsCount - 1 - shift) {
        t.pass();
      } else {
        t.fail(`
    reject on last step (it must be a true): ${testObj.reject.state}
    steps count: ${stepsCount}
    shift: ${shift}
    steps passed: ${testObj.passedSteps.get()}
    `);
      }

      t.end();
    });
  }
}

test.cb('create sequence and full series executing',
  (t) => checkValidEnding(createSequenceAndRun, t));
test.cb('create Stepper instance and full series executing',
  (t) => checkValidEnding(createStepperAndRun, t));

testShiftedValidEnding(createSequenceAndRun, 'sequence');
testShiftedValidEnding(createStepperAndRun, 'Stepper instance');
