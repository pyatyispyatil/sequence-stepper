# sequence-stepper

The small lib for the asynchronous control of queue of functions. It can start an execution at any step in a queue till the end.

## Installation

```console
npm install --save sequence-stepper
```

## Usage

### class Stepper
Creation a stepper queue
```js
import {Stepper} from 'sequence-stepper';

let stepper = new Stepper([
  (step, data, done) => step.next(++data),
  (step, data, done) => data > 2 ? step.next(data * 2) : step.reject('fail'),
  (step, data, done) => done ? console.log(data) : null;
], (message) => console.log(message));
```

Callbacks arguments description
 - _step_ - a StepDescription instance. With that you can manipulate an execution.
 - _data_ - returned value of previous step
 - _done_ - flag of last step

Start an execution
```js
stepper.start(data);
```

You can step back with the same code (backward step doesn't execute)
```js
stepper.prev();
```

Execute a step after stepDescriptor
```js
stepper.next(data, stepper.steps[2]);
```

Execution on some step in queue
```js
let savedStepDescriptor;

let stepper = new Stepper([
  (step) => {...},
  (step) => {
    //some behavior
    ...
    savedStepDescriptor = step;
    step.next();
  },
  (step) => {...}
]);

stepper.start()//execute queue till the end

savedStepDescriptor.next()//execute queue from saved step till the end;
```

insertBefore and insertAfter usage
```js
let stepper = new Stepper([
  ...
  (step) => {
    step.insertAfter((step) => step.next());
    step.insertBefore((step) => step.next());
    step.next();
  },
  ...
]);
```
or
```js
let stepper = new Stepper([...]);
stepper.insertAfter(stepper.getStep(2), ({next}) => next());
```
or
```js
let savedStepDescriptor;

let stepper = new Stepper([
  ...
  (step) => {
    savedStepDescriptor = step;
    step.next();
  },
  ...
]);

savedStepDescriptor.insertAfter(({next}) => next());
```

Brief usage of Stepper
```js
let stepper = new Stepper([
  ({next}) => next(),
  ({next}) => setTimeout(next, 100),
  ({next}) => console.log('complete')
]);

stepper.start();
```

### function sequence
Its help you to make a function thats launches a queue till the end. You can make it with this simple functional conveyors.
```js
import {sequence} from 'sequence-stepper';

let queue = sequence([
  (step, data, done) => step.next(data * 2),
  (step, data, done) => step.next(data + 4),
  (step, data, done) => data * 3,
]);

let result = queue(5);//result === 42
```

You can add an asynchronous behavior into a steps
```js
let queue = sequence([
  (step, data, done) => setTimeout(() => step.next(data + 11), 100),
  (step, data, done) => console.log(data * 2),
]);

queue(10);//output 42 in console after 100ms
```


### Notice
In outline Stepper and sequence has a similar behavior. 
If you don`t want to use insertAfter and insertBefore, you can restrict a sequence.
