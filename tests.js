import test from 'ava';

import {sequence} from './src/stepper';

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
  return (new Array(count)).fill(null).map((itm, index) => (step, data) => {
    if (index - 1 === data ? 1 : 0) {
      passedStepsCounter.add();
    }

    descriptors[index] = step;

    step.next ? step.next(index) : step.reject(index);
  });
}

function createSequenceAndRun(count) {
  let reject = {state: false},
    descriptors = [],
    passedSteps = new Counter(),
    steps = createSteps(count, passedSteps, descriptors);

  sequence(steps, () => reject.state = true)(-1);

  return {
    descriptors: descriptors.slice(),
    passedSteps,
    reject
  }
}

test.cb('create sequence and full series executing', (t) => {
  let stepsCount = 10, seq = createSequenceAndRun(stepsCount);
  
  if (seq.reject.state && seq.passedSteps.get() === stepsCount) {
    t.pass();
  } else {
    t.fail(`
    reject on last step (it must be a true): ${seq.reject.state}
    steps count: ${stepsCount}
    steps passed: ${seq.passedSteps.get()}
    `);
  }

  t.end();
});


function testSequenceFromIndex(index) {
  test.cb(`create sequence and random executing from ${index} to end`, (t) => {
    let stepsCount = 10, seq = createSequenceAndRun(stepsCount);
    
    seq.reject.state = false;
    seq.passedSteps.reset();
    seq.descriptors[index].next ? seq.descriptors[index].next(index) : seq.descriptors[index].reject(index);
    
    if (seq.reject.state && seq.passedSteps.get() === stepsCount - index - 1) {
      t.pass();
    } else {
      t.fail(`
    reject on last step (it must be a true): ${seq.reject.state}
    steps count: ${stepsCount}
    index from: ${index}
    steps passed: ${seq.passedSteps.get()}
    `);
    }

    t.end();
  });
}

for (let step = 10; step--;) {
  testSequenceFromIndex(step);
}
