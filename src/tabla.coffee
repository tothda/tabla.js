((context) ->

  class Tabla
    constructor: (@name) ->
      @rules = []

    evaluateRules: ->
      log @name + " started."

      hasMatchedRule = false
      _.each @rules, (rule, i) =>
        return  if hasMatchedRule
        log "  " + (i + 1) + ". Rule started."
        isMatching = rule.evaluate()
        if isMatching
          log "  " + (i + 1) + ". Rule: succeeded. Running action with args:", rule._args
          hasMatchedRule = true
          if @matching is rule
            log "State hasn't changed. No need for action.'"
          else
            rule.runAction()
            @matching = rule
        else
          log "  " + (i + 1) + ". Rule: failed."

      if not hasMatchedRule and @elseRule
        log "Running elseRule action with args:", @elseRule._args
        @elseRule.runAction()
        @matching = @elseRule

    _buildRule: ->
      @rules.push @rule  if @rule and not @rule.elseRule

    withInputElements: (inputs...) ->
      @inputs = inputs
      @

    withAction: (@action) -> @

    withEnterAction: (@enterAction) -> @

    withExitAction: (@exitAction) -> @

    startFromHere: () ->
      @matching = @rule
      @

    whenMatches: (fns...)->
      terms = (new Term(fn) for fn in fns)
      @rule = new Rule(@, terms)
      @

    when: (args...)->
      terms = _.chain(@inputs).zip(args).map(([input, val]) ->
        new Term(input, val)
      ).value()
      @_buildRule()
      @rule = new Rule(@, terms)
      @

    otherwise: ->
      @_buildRule()
      @rule = @elseRule = new Rule(@)
      @rule.elseRule = true
      @

    args: (args...)->
      @rule.args args
      @

    build: ->
      @_buildRule()
      => @evaluateRules()

  Tabla.any = -> true

  log = (args...) ->
    console.log.apply console, args if Tabla.LOGGING


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
        @fn = => @predicate(val(@elem))
      else
        @value = args[1]
        @fn = => val(@elem) is @value

    evaluate: ->
      @fn.call()

    isMatching: Term::evaluate

    toString: ->
      return @elem.selector + "===" + @value  if @elem
      "(fn)"

  class Rule
    constructor: (@table, @terms) ->
      @_args = []

    args: (args) ->
      @_args = args

    evaluate: ->
      firstFailed = _.find @terms, (term) -> not term.isMatching()
      log "Failed term:", firstFailed.toString() if firstFailed
      !!!firstFailed

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