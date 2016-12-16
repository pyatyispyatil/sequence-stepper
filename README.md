#sequence-stepper

The small lib for the asynchronous control of queue of functions. It can start an execution at any step in a queue till the end.

##Installation

```console
npm install --save sequence-stepper
```

##Usage

###class Stepper
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
stepper.next(data);
```

You can step back with the same code (backward step doesn't execute)
```js
stepper.prev();
```

Execute a step after stepDescriptor
```js
stepper.next(data, stepper[2]);
```

Execution on some step in queue
```js
let savedStepDescriptor;

let stepper = new Stepper([
  (step, data, done) => {...},
  (step, data, done) => {
    //some behavior
    ...
    savedStepDescriptor = step;
    step.next();
  },
  (step, data, done) => {...}
]);

stepper.next()//execute queue till the end

savedStepDescriptor.next()//execute queue from saved step till the end;
```

###function sequence
Its help you to make a function thats launches a queue to the end. You can make it with this simple functional conveyors.
```js
import {sequence} from 'Stepper'

let queue = sequence([
  (step, data, done) => step.next(data * 2),
  (step, data, done) => step.next(data + 4),
  (step, data, done) => data * 3,
])

let result = queue(5);//result === 42
```

You can add an asynchronous behavior into a steps
```js
let queue = sequence([
  (step, data, done) => setTimeout(() => step.next(data + 11), 100),
  (step, data, done) => console.log(data * 2),
])

queue(10);//output 42 in console after 100ms
```
