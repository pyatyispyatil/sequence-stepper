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
    if (index === data) {
      passedStepsCounter.add();
    }

    descriptors[index] = step;

    step[done ? 'reject' : 'next'](index + 1);
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

  return {startValue: 0, reject, descriptors, passedSteps, steps, count};
}


function createSequenceAndRun(count) {
  let testObj = createWrappedSteps(count);

  sequence(testObj.steps, testObj.reject.cb)(testObj.startValue);

  return testObj;
}

function createStepperAndRun(count) {
  let testObj = createWrappedSteps(count),
    stepper = new Stepper(testObj.steps, testObj.reject.cb);

  stepper.start(testObj.startValue);

  return testObj;
}

function makeSequenceChecker(desiredStepsSeq, onFail) {
  let stepsLeft = desiredStepsSeq.slice();

  return (index) => {
    const [current, ...rest] = stepsLeft;

    if (current !== index) {
      onFail(`fail on step ${current}`);
    }

    stepsLeft = rest;
  }
}

function checkAsyncHoleyStepper() {
  test.cb('checking async holey Stepper with inserting steps', (t) => {
    let checker = makeSequenceChecker([0, 1, 2, 3, 4], (message) => t.fail(message));
    let stepper = new Stepper([
      (step) => {
        checker(0);
        step.next();
      },
      (step) => {
        checker(1);
        setTimeout(() => {
          step.insertAfter((step) => {
            checker(2);
            setTimeout(() => {
              step.insertAfter((step) => {
                checker(3);
                step.next();
              });
              step.next();
            }, 1);
          });
          step.next();
        }, 1)
      },
      () => {
        checker(4);

        t.pass();
        t.end();
      }
    ]);

    stepper.next();
  });
}

function checkValidEnding(factory, title) {
  test.cb(`create ${title} and full series executing`, (t) => {
    let stepsCount = 10, testObj = factory(stepsCount);

    if (testObj.reject.state && testObj.passedSteps.get() === stepsCount) {
      t.pass();
    } else {
      t.fail(`
    reject on last step (it must be a true): ${testObj.reject.state}
    steps count: ${stepsCount}
    steps passed: ${testObj.passedSteps.get()}
    `);
    }

    t.end();
  });
}

function testShiftedValidEnding(factory, title) {
  let stepsCount = 10, testObj = factory(stepsCount);

  for (let shift = stepsCount; shift--;) {
    test.cb(`create ${title} and random executing from ${shift} to end`, (t) => {
      testObj.reject.state = false;
      testObj.passedSteps.reset();

      if (shift < stepsCount - 1) {
        testObj.descriptors[shift].next(shift + 1);
      } else {
        testObj.descriptors[shift].reject(shift + 1);
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

checkValidEnding(createSequenceAndRun, 'sequence');
checkValidEnding(createStepperAndRun, 'Stepper instance');

testShiftedValidEnding(createSequenceAndRun, 'sequence');
testShiftedValidEnding(createStepperAndRun, 'Stepper instance');
checkAsyncHoleyStepper();
