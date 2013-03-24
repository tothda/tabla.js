describe "Tabla", ->
  it "should be instantiated without arguments", ->
    expect(new Tabla()).not.toBe null

  describe "With a when/then rule", ->
    beforeEach ->
      @fn = => @fnResult
      @spy = jasmine.createSpy()
      @tabla = (new Tabla())
        .withAction(@spy)
        .whenMatches(@fn)
        .args(1, 2, 3)
        .build()

    it "calls the action when when is true", ->
      @fnResult = true
      @tabla()
      expect(@spy).toHaveBeenCalledWith 1, 2, 3

    it "doesn't call the action when the rule doesn't match", ->
      @fnResult = false
      @tabla()
      expect(@spy).not.toHaveBeenCalled()


  describe "With an otherwise rule + enter/exit action", ->
    beforeEach ->
      @fn1 = => @fn1Result
      @fn2 = => @fn2Result
      @enterSpy = jasmine.createSpy()
      @exitSpy = jasmine.createSpy()
      @tabla = (new Tabla())
        .withEnterAction(@enterSpy)
        .withExitAction(@exitSpy)
        .whenMatches(@fn1).args("fn1").startFromHere()
        .whenMatches(@fn2).args("fn2")
        .otherwise().args("otherwise")
        .build()

    it "First: exitAction of start rule, then enter action of next", ->
      @fn1Result = false
      @fn2Result = true
      @tabla()
      expect(@exitSpy).toHaveBeenCalledWith "fn1"
      expect(@enterSpy).toHaveBeenCalledWith "fn2"

    it "Calls the otherwise action if none of the rules match.", ->
      @fn1Result = false
      @fn2Result = false
      @tabla()
      expect(@exitSpy).toHaveBeenCalledWith "fn1"
      expect(@enterSpy).toHaveBeenCalledWith "otherwise"

describe "Tabla.Term", ->
  it "Cannot be instantiated without argument.", ->
    expect(-> new Tabla.Term()).toThrow new TypeError("Unexpected arguments.")

  describe "jQuery element + value", ->
    beforeEach ->
      @checkbox = $("<input type=\"checkbox\" checked=\"checked\"/>")
      @term = new Tabla.Term(@checkbox, true)

    it "Cannot be instantiated..", ->
      expect new Tabla.Term(@checkbox, true)

    it "Checkbox: when checked then matches true", ->
      expect(@term.evaluate()).toBeTruthy()

    it "Checkbox: when not checked then matches false ", ->
      @checkbox.trigger "click"
      expect(@term.evaluate()).toBeFalsy()

  describe "With binary function", ->
    it "Evaluates to the same value as the fn.", ->
      falseTerm = new Tabla.Term(-> false)
      trueTerm = new Tabla.Term(-> true)
      expect(falseTerm.evaluate()).toBeFalsy()
      expect(trueTerm.evaluate()).toBeTruthy()

describe "Tabla.Rule", ->
  it "Can be instantiated", ->
    expect(new Tabla.Rule()).not.toBe null
