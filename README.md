#sequence-stepper

A small lib for asynchronous control stack of functions. It can start executing on any step in queue to the end.

##Installation

```console
npm install --save sequence-stepper
```

##Usage

###class Stepper
Creating a stepper queue
```js
import {Stepper} from 'stepper';

let stepper = new Stepper([
  (step, data) => step.next(++data),
  (step, data) => data > 2 ? step.next(data * 2) : step.reject('fail'),
  (step, data) => console.log(data)
]);
```

Start executing
```js
stepper.next(data);
```

You can return to the backward step with same code (backward step dos't execute)
```js
stepper.prev();
```

Execute step after said stepDescriptor
```js
stepper.next(data, stepper[2]);
```

Executing on some step in queue:
```js
let savedStepDescriptor;

let stepper = new Stepper([
  (step, data) => {...},
  (step, data) => {
    //some behavior
    ...
    savedStepDescriptor = step;
    step.next();
  },
  (step, data) => {...}
]);

stepper.next()//execute queue to the end

savedStepDescriptor.next()//execute queue from saved step to the end;
```

###function sequence
Its help you to make a function thats launches a queue to the end. You can make with that simple functional conveyors.
```js
import {sequence} from 'Stepper'

let queue = sequence([
  (step, data) => step.next(data * 2),
  (step, data) => step.next(data + 4),
  (step, data) => data * 3,
])

let result = queue(5);//result === 42
```

You can add asynchronous behavior into steps
```js
let queue = sequence([
  (step, data) => setTimeout(() => step.next(data + 11), 100),
  (step, data) => console.log(data * 2),
])

queue(10);//output 42 in console after 100ms
```
