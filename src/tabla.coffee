((context) ->

  createPredicate = (input, val) ->
    ->
      val is ((if input.is(":checked") then "1" else "0"))

  combineWith = (combineFn, colls...) ->
    l = colls[0].length
    result = []
    i = 0

    while i < l
      args = _.map(colls, (coll) ->
        coll[i]
      )
      result.push combineFn.apply(`undefined`, args)
      i++
      result

  class Tabla
    constructor: (@name) ->
      @rules = []

    evaluateRules: ->
      log @name + " started."
      me = this
      hasMatchedRule = false
      _.each @rules, (rule, i) ->
        return  if hasMatchedRule
        log "  " + (i + 1) + ". Rule started."
        isMatching = rule.evaluate()
        if isMatching
          log "  " + (i + 1) + ". Rule: succeeded. Running action with args:", rule._args
          hasMatchedRule = true
          if me.matching is rule
            log "State hasn't changed. No need for action.'"
          else
            rule.runAction()
            me.matching = rule
        else
          log "  " + (i + 1) + ". Rule: failed."

      if not hasMatchedRule and @elseRule
        log "Running elseRule action with args:", @elseRule._args
        @elseRule.runAction()
        @matching = @elseRule

    _buildRule: ->
      @rules.push @rule  if @rule and not @rule.elseRule

    withInputElements: (inputs...)->
      @inputs = inputs
      this

    withAction: (fn) ->
      @action = fn
      this

    withEnterAction: (fn) ->
      @enterAction = fn
      this

    withExitAction: (fn) ->
      @exitAction = fn
      this

    startFromHere: ->
      @matching = @rule
      this

    whenMatches: (terms...)->
      terms = _.chain(terms).map((fn) ->
        new Term(fn)
      ).value()
      @rule = new Rule(this, terms)
      this

    when: (args...)->
      terms = _.chain(@inputs).zip(args).map((pair) ->
        new Term(pair[0], pair[1])
      ).value()
      @_buildRule()
      @rule = new Rule(this, terms)
      this

    otherwise: ->
      @_buildRule()
      @rule = @elseRule = new Rule(this)
      @rule.elseRule = true
      this

    args: (args...)->
      @rule.args args
      this

    build: ->
      @_buildRule()
      me = this
      ->
        me.evaluateRules()

  Tabla.any = ->
    true

  log = (args...) ->
    if Tabla.LOGGING
      console.log.apply console, args


  class Term
    # Supported parameters:
    # (fn) - with binary function (returns true/false)
    # (elem, fn) - with predicate function (binary fn with one parameter)
    # (elem, string)
    constructor: (args...) ->
      val = (elem) ->
        return elem.is(":checked")  if elem.is(":checkbox")
        return elem.filter(":checked").val()  if elem.is(":radio")
        elem.val()

      throw new TypeError("Unexpected arguments.")  if args.length is 0
      me = this
      firstArg = args[0]
      if args.length is 1
        if $.isFunction(firstArg)
          @fn = firstArg
          return
        else
          throw new TypeError("Argument error: should be a function.")
      @elem = firstArg
      if $.isFunction(args[1])
        @predicate = args[1]
        @fn = ->
          me.predicate val(me.elem)
      else
        @value = args[1]
        @fn = ->
          val(me.elem) is me.value

    evaluate: ->
      @fn.call()

    toString: ->
      return @elem.selector + "===" + @value  if @elem
      "(fn)"

  class Rule
    constructor: (@table, @terms) ->
      @_args = []

    args: (args) ->
      @_args = args

    evaluate: ->
      ruleMatches = true
      _.each @terms, (term, j) ->
        return  unless ruleMatches
        result = term.evaluate()
        log "    " + (j + 1) + ". Term:", term.toString(), result
        ruleMatches = false  unless result
      ruleMatches

    runEnterAction:  ->
      @table.enterAction.apply `undefined`, @_args

    runExitAction: ->
      @table.exitAction.apply `undefined`, @_args

    runAction: ->
      if @table.action
        @table.action.apply `undefined`, @_args
      else
        # In this case we assume the table has an enter and an exit action.
        exitingRule = @table.matching
        exitingRule.runExitAction()  if exitingRule
        @runEnterAction()

  Tabla.Term = Term
  Tabla.Rule = Rule
  context.Tabla = Tabla
) window