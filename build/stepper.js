'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepDescriptor = function () {
  /**
   * @param {Function} step - action, which will be carried out in the executing of this step
   * @param {Stepper} stepper - instance of Stepper, which contains this StepDescriptor
   * */
  function StepDescriptor(step, stepper) {
    var _this = this;

    _classCallCheck(this, StepDescriptor);

    this.id = 0;

    this.id = StepDescriptor.ID_COUNTER;
    StepDescriptor.ID_COUNTER++;

    this.stepper = stepper;
    this.action = step;
    this.execute = function (data) {
      return step(_this, data);
    };
  }

  _createClass(StepDescriptor, [{
    key: 'next',


    /**
     * @param {*} data
     * */
    value: function next(data) {
      return this.stepper.next(data, this);
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.stepper.remove(this);
    }

    /**
     * @param {*} data
     * */

  }, {
    key: 'reject',
    value: function reject(data) {
      this.stepper.reject(data);
    }
  }]);

  return StepDescriptor;
}();

StepDescriptor.ID_COUNTER = 0;

var Stepper = exports.Stepper = function () {
  /**
   * @param {Function[]} steps - array of steps, which will be treated
   * @param {Function} onReject - callback, which will be executing on some step
   * */
  function Stepper(steps) {
    var _this2 = this;

    var onReject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
      return null;
    };

    _classCallCheck(this, Stepper);

    this.steps = [];
    this.currentStep = -1;

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
     * @return {Boolean} flag of the last step
     * */
    value: function next() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var stepDescriptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (stepDescriptor) {
        this.currentStep = this.steps.findIndex(function (step) {
          return step.id === stepDescriptor.id;
        });
      }

      this.currentStep++;
      this.steps[this.currentStep].execute(data);

      return this.currentStep === this.steps.length - 1;
    }
  }, {
    key: 'prev',
    value: function prev() {
      this.currentStep--;
    }

    /**
     * @param {StepDescriptor} stepDescriptor
     * */

  }, {
    key: 'remove',
    value: function remove(stepDescriptor) {
      this.steps.splice(this.steps.findIndex(function (step) {
        return step.id === stepDescriptor.id;
      }), 1);
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
     * @param {StepDescriptor} stepDescriptor
     * @return {Number}
     * */

  }, {
    key: 'getIndex',
    value: function getIndex(stepDescriptor) {
      var index = this.steps.findIndex(function (step) {
        return step.id === stepDescriptor.id;
      });

      if (index === -1) {
        throw new Error('Cannot find step in steps array');
      } else {
        return index;
      }
    }

    /**
     * @param {StepDescriptor} stepDescriptor - descriptor of the step before which will be inserted a new step
     * @param {Function} step - callback for the new step descriptor
     * @return {StepDescriptor}
     * */

  }, {
    key: 'insertBefort',
    value: function insertBefort(stepDescriptor, step) {
      return this.add(step, this.getIndex(stepDescriptor) - 1);
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

function _sequence(steps, reject) {
  var _steps$slice$reverse = steps.slice().reverse(),
      _steps$slice$reverse2 = _toArray(_steps$slice$reverse),
      last = _steps$slice$reverse2[0],
      firsts = _steps$slice$reverse2.slice(1);

  return function (initialData) {
    return firsts.reduce(function (nextStep, step) {
      return function (comingStep, data) {
        return step({
          next: function next(data) {
            return nextStep(comingStep, data);
          },
          reject: reject
        }, data);
      };
    }, last)({ reject: reject }, initialData);
  };
}
exports.sequence = _sequence;