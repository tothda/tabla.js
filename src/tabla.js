(function(context) {
  var Tabla = function(name) {
    this.rules = [];
    this.name = name;
  }

  var TP = Tabla.prototype;

  var createPredicate = function(input, val){
    return function() {
      return val === (input.is(':checked') ? '1':'0');
    };
  };

  var combineWith = function(combineFn) {
    var colls = _.toArray(arguments).slice(1);
    var l = colls[0].length;
    var result = [];

    for (var i = 0; i < l; i++) {
      var args = _.map(colls, function(coll){
                   return coll[i];
                 });
      result.push(combineFn.apply(undefined, args));
    }

    return result;
  }

  TP.evaluateRules = function() {
    log(this.name + ' started.');
    var me = this
      , hasMatchedRule = false;
    _.each(this.rules, function(rule, i) {
      if (hasMatchedRule) { return; }
      log('  ' + (i+1) + '. Rule started.');
      var isMatching = rule.evaluate();

      if (isMatching) {
        log('  ' + (i+1) + '. Rule: succeeded. Running action with args:', rule.args);
        hasMatchedRule = true;
        if (me.matching === rule) {
          log("State hasn't changed. No need for action.'");
        } else {
          rule.runAction();
          me.matching = rule;
        }
      } else {
        log('  ' + (i+1) + '. Rule: failed.')
      }
    });

    if (!hasMatchedRule && this.elseRule) {
      log('Running elseRule action with args:', this.elseRule.args);
      this.elseRule.runAction();
    }
  };

  TP._buildRule = function(){
    if (this.rule && !this.rule.elseRule) {
      this.rules.push(this.rule);
    }
  };

  TP.withInputElements = function() {
    this.inputs = _.toArray(arguments);
    return this;
  };

  TP.withAction = function(fn) {
    this.action = fn;
    return this;
  };

  TP.withEnterAction = function(fn) {
    this.enterAction = fn;
    return this;
  }

  TP.withExitAction = function(fn) {
    this.exitAction = fn;
    return this;
  }

  TP.startFromHere = function() {
    this.matching = this.rule;
    return this;
  };

  TP.whenMatches = function() {
    var terms = _.chain(arguments)
                .map(function(fn){ return new Term(fn); })
                .value();
    this.rule = new Rule(this, terms);
    return this;
  };

  TP.when = function() {
    var args = _.toArray(arguments)
      , terms = _.chain(this.inputs)
                 .zip(args)
                 .map(function(pair) { return new Term(pair[0], pair[1])})
                 .value();

    this._buildRule();
    this.rule = new Rule(this, terms);
    return this;
  }

  TP.otherwise = function() {
    this._buildRule();
    this.rule = this.elseRule = new Rule(this);
    this.rule.elseRule = true;
    return this;
  }

  TP.args = function() {
    var args = _.toArray(arguments);
    this.rule.args(args);
    return this;
  }

  TP.build = function() {
    this._buildRule();
    var me = this;
    return function() {
      me.evaluateRules();
    };
  };

  Tabla.any = function() { return true; }

  var log = function() {
    if (Tabla.LOGGING) {
      var args = _.toArray(arguments);
      console.log.apply(console, args);
    }
  }

  // Supported parameters:
  // (fn) - with binary function (returns true/false)
  // (elem, fn) - with predicate function (binary fn with one parameter)
  // (elem, string)
  var Term = function(){
    var args = _.toArray(arguments);

    if (args.length === 0) {
      throw new TypeError("Unexpected arguments.")
    }

    function val(elem) {
      if (elem.is(':checkbox')) { return elem.is(':checked'); }
      if (elem.is(':radio')) { return elem.filter(':checked').val(); }
      return elem.val();
    }

    var me = this
      , firstArg = args[0];

    if (args.length === 1) {
      if ($.isFunction(firstArg)) {
        this.fn = firstArg;
        return;
      } else {
        throw new TypeError("Argument error: should be a function.")
      }
    }

    this.elem = firstArg;
    if ($.isFunction(args[1])) {
      this.predicate = args[1];
      this.fn = function() {
        return me.predicate(val(me.elem));
      }
    } else {
      this.value = args[1];
      this.fn = function() {
        return val(me.elem) === me.value;
      };
    }
  };


  Term.prototype.evaluate = function(){ return this.fn.call(); };

  Term.prototype.toString = function(){
    if (this.elem) {return this.elem.selector + '===' + this.value;}
    return "(fn)";
  };

  var Rule = function(table, terms){
    this.table = table;
    this.terms = terms;
    this._args = [];
  };

  Rule.prototype.args = function(args) {
    this._args = args;
  };

  Rule.prototype.evaluate = function() {
    var ruleMatches = true;
    _.each(this.terms, function(term, j) {
      if (!ruleMatches) { return; }
      var result = term.evaluate();
        log('    ' + (j+1) + '. Term:', term.toString(), result);
        if (!result) { ruleMatches = false; }
    });
    return ruleMatches;
  };

  Rule.prototype.runEnterAction = function() {
    this.table.enterAction.apply(undefined, this._args);
  };

  Rule.prototype.runExitAction = function() {
    this.table.exitAction.apply(undefined, this._args);
  };

  Rule.prototype.runAction = function() {
    if (this.table.action) {
      this.table.action.apply(undefined, this._args);
    } else {
      // In this case we assume the table has an enter and an exit action.
      var exitingRule = this.table.matching;
      if (exitingRule) { exitingRule.runExitAction(); }
      this.runEnterAction();
    }
  };

  Tabla.Term = Term;
  Tabla.Rule = Rule;
  context.Tabla = Tabla;
})(window);
