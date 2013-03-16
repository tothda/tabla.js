(function(context) {

  var Valuable = function(elem) { this.elem = elem; }
  Valuable.prototype.val = function(){
  }
  // Supported parameters:
  // (elem, fn)
  // (elem, string)
  var Term = function(){
    var args = _.toArray(arguments);

    function val(elem) {
      if (elem.is(':checkbox')) { return elem.is(':checked'); }
      if (elem.is(':radio')) { return elem.filter(':checked').val(); }
      return elem.val();
    }

    var me = this;
    this.elem = args[0];
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
    return _.template(
      "(<%= selector %> === <%= value%>)"
    , {
      selector: this.elem.selector,
      value: this.value
    });
  };

  var Rule = function(terms){
    this.terms = terms;
  };

  Rule.prototype.args = function(args) {
    this.args = args;
  };

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
    console.log('Evaluating rules for ' + this.name + ' started.');
    var me = this
      , hasMatchedRule = false;
    _.each(this.rules, function(rule) {
      var ruleMatches = true;
      _.each(rule.terms, function(term) {
        if (!ruleMatches) { return; }
        var result = term.evaluate();
        console.log(term.toString(), result);
        if (!result) { ruleMatches = false; }
      });
      if (ruleMatches) {
        console.log('Rule: succeeded. Running action with args:', rule.args);
        hasMatchedRule = true;
        me.action.apply(undefined, rule.args);
      } else {
        console.log('Rule: failed.')
      }
    });
    if (!hasMatchedRule && this.elseRule) {
      console.log('Running elseRule action with args:', this.elseRule.args);
      this.action.apply(undefined, this.elseRule.args);
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

  TP.when = function() {
    var args = _.toArray(arguments)
      , terms = _.chain(this.inputs)
                 .zip(args)
                 .map(function(pair) { return new Term(pair[0], pair[1])})
                 .value();

    this.rule = new Rule(terms);
    return this;
  }

  TP.otherwise = function() {
    this.rule = this.elseRule = new Rule();
    return this;
  }

  TP.args = function() {
    var args = _.toArray(arguments);
    this.rule.args(args);
    if (!this.elseRule) {
      this.rules.push(this.rule);
    }
    return this;
  }

  TP.build = function() {
    var me = this;
    return function() {
      me.evaluateRules();
    };
  };

  Tabla.any = function() { return true; }

  context.Tabla = Tabla;
})(window);
