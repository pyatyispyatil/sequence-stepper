'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepDescriptor =
/**
 * @param {Function} step - action, which will be carried out in the executing of this step
 * @param {Stepper} stepper - instance of Stepper, which contains this StepDescriptor
 * */
function StepDescriptor(step, stepper) {
  var _this = this;

  _classCallCheck(this, StepDescriptor);

  _initialiseProps.call(this);

  this.id = StepDescriptor.ID_COUNTER;
  StepDescriptor.ID_COUNTER++;

  this.stepper = stepper;
  this.action = step;
  this.execute = function (data, done) {
    return step(_this, data, done);
  };
}

/**
 * @param {*} [data]
 * */


/**
 * @param {*} data
 * */


/**
 * @param {Function} step
 * @return {StepDescriptor}
 * */


/**
 * @param {Function} step
 * @return {StepDescriptor}
 * */
;

StepDescriptor.ID_COUNTER = 0;

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.id = 0;

  this.next = function (data) {
    return _this3.stepper.next(data, _this3);
  };

  this.prev = function () {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    return _this3.stepper.prev(data, _this3);
  };

  this.remove = function () {
    return _this3.stepper.remove(_this3);
  };

  this.reject = function (data) {
    return _this3.stepper.reject(data);
  };

  this.insertAfter = function (step) {
    return _this3.stepper.insertAfter(_this3, step);
  };

  this.insertBefore = function (step) {
    return _this3.stepper.insertBefore(_this3, step);
  };
};

var Stepper = exports.Stepper = function () {
  /**
   * @param {Function[]} steps - array of steps, which will be treated
   * @param {Function} [onReject] - callback, which will be executing on some step
   * */
  function Stepper(steps) {
    var _this2 = this;

    var onReject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
      return null;
    };

    _classCallCheck(this, Stepper);

    this.steps = [];
    this.currentStep = null;

    steps.forEach(function (step) {
      return _this2.add(step);
    });
    this.reject = onReject;
  }

  _createClass(Stepper, [{
    key: 'next',


    /**
     * @param {*} [data]
     * @param {StepDescriptor} [stepDescriptor]
     * */
    value: function next() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var stepDescriptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var isInitialStep = this.currentStep === null && stepDescriptor === null;
      var nextStepIndex = isInitialStep ? 0 : this.getIndex(stepDescriptor || this.currentStep) + 1;

      if (nextStepIndex < this.steps.length) {
        var isEnded = nextStepIndex === this.steps.length - 1;

        this.currentStep = stepDescriptor ? stepDescriptor : this.steps[nextStepIndex];
        this.steps[nextStepIndex].execute(data, isEnded);
      } else {
        throw new Error('Steps executing are ended. You cannot call "next" method.');
      }
    }

    /**
     * @param {Number} stepsCount - distance to step back
     * @param {StepDescriptor} stepDescriptor
     * @return {StepDescriptor}
     * */

  }, {
    key: 'prev',
    value: function prev() {
      var stepsCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var stepDescriptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var targetPos = this.getIndex(stepDescriptor || this.currentStep) - stepsCount;

      if (targetPos >= 0) {
        this.currentStep = this.steps[targetPos];

        return this.currentStep;
      } else {
        throw new Error('Cannot step back on pos ' + targetPos);
      }
    }

    /**
     * Start execution a queue from start
     * @param {*} data
     * */

  }, {
    key: 'start',
    value: function start(data) {
      this.currentStep = null;
      this.next(data);
    }

    /**
     * @param {StepDescriptor} stepDescriptor
     * */

  }, {
    key: 'remove',
    value: function remove(stepDescriptor) {
      var removedStepIndex = this.getIndex(stepDescriptor);

      if (this.currentStep !== null && stepDescriptor.id === this.currentStep.id) {
        this.currentStep = this.steps[removedStepIndex - 1];
      }

      this.steps.splice(removedStepIndex, 1);
    }

    /**
     * @param {Function} step
     * @param {Number} index
     * @return {StepDescriptor}
     * */

  }, {
    key: 'add',
    value: function add(step) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var stepDescriptor = new StepDescriptor(step, this);

      if (index == null) {
        this.steps.push(stepDescriptor);
      } else {
        this.steps.splice(index, 0, stepDescriptor);
      }

      return stepDescriptor;
    }

    /**
     * @param {StepDescriptor} firstStepDescriptor
     * @param {StepDescriptor} secondStepDescriptor
     * */

  }, {
    key: 'swap',
    value: function swap(firstStepDescriptor, secondStepDescriptor) {
      var firstIndex = this.getIndex(firstStepDescriptor);
      var secondIndex = this.getIndex(secondStepDescriptor);

      this.steps.splice(firstIndex, 1, secondStepDescriptor);
      this.steps.splice(secondIndex, 1, firstStepDescriptor);
    }

    /**
     * @param {StepDescriptor} stepDescriptor
     * @return {Number}
     * */

  }, {
    key: 'getIndex',
    value: function getIndex(stepDescriptor) {
      var index = this.steps.findIndex(function (step) {
        return stepDescriptor && step.id === stepDescriptor.id;
      });

      if (index === -1) {
        throw new Error('Cannot find step in steps array');
      } else {
        return index;
      }
    }

    /**
     * @param {Number} index - position in steps array
     * @return {StepDescriptor}
     * */

  }, {
    key: 'getStep',
    value: function getStep(index) {
      return this.steps[index];
    }

    /**
     * @param {StepDescriptor} stepDescriptor - descriptor of the step before which will be inserted a new step
     * @param {Function} step - callback for the new step descriptor
     * @return {StepDescriptor}
     * */

  }, {
    key: 'insertBefore',
    value: function insertBefore(stepDescriptor, step) {
      return this.add(step, this.getIndex(stepDescriptor));
    }

    /**
     * @param {StepDescriptor} stepDescriptor - descriptor of the step after which will be inserted a new step
     * @param {Function} step - callback for the new step descriptor
     * @return {StepDescriptor}
     * */

  }, {
    key: 'insertAfter',
    value: function insertAfter(stepDescriptor, step) {
      return this.add(step, this.getIndex(stepDescriptor) + 1);
    }

    /**
     * Treats steps and return a sequence of all steps. It can not be edited.
     * In every step arguments will be a Object with "next" and "reject" methods.
     * @return {Function} first step
     * */

  }, {
    key: 'sequence',
    value: function sequence() {
      return _sequence(this.steps.map(function (step) {
        return step.raw;
      }), this.reject);
    }
  }]);

  return Stepper;
}();

/**
 * @param {Function[]} steps
 * @param {Function} [reject]
 * */


function _sequence(steps) {
  var reject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return null;
  };

  var hasSteps = !(steps.length - 1);
  var seq = steps.reduceRight(function (nextStep, step, index) {
    var next = index === steps.length - 2 ? function (nextData) {
      return nextStep({ reject: reject }, nextData, true);
    } : function (nextData) {
      return nextStep(nextData, false);
    };

    return function (data, done) {
      return step({ next: next, reject: reject }, data, done);
    };
  });

  return function (initialData) {
    return seq(initialData, hasSteps);
  };
}
exports.sequence = _sequence;