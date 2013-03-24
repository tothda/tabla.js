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

describe "Tabla.JQueryInputTerm", ->
  J = Tabla.JQueryInputTerm

  beforeEach ->
    @checkbox = $("<input type=\"checkbox\" checked=\"checked\"/>")
    
  it "is defined", ->
    expect(Tabla.JQueryInputTerm).toBeDefined()

  it "knows the input's type", ->
    expect(new J($('<input type="checkbox" />'), "").type()).toBe("checkbox")
    expect(new J($('<input type="text" />'), "").type()).toBe("text")
    expect(new J($('<input type="select" />'), "").type()).toBe("select")
    expect(new J($('<input type="radio" />'), "").type()).toBe("radio")
    expect(new J($('<select></select>'), "").type()).toBe("select")

  it "knows its input's value'", ->
    expect(new J($('<input type="checkbox" checked="checked" />'), '').val()).toBe(true)
    expect(new J($('<input type="input" value="foo" />'), '').val()).toBe("foo")

  it "handles checkbox with boolean value", ->
    @term = new Tabla.JQueryInputTerm(@checkbox, true)
    expect(@term.evaluate()).toBeTruthy()
    @checkbox.prop('checked', false)
    expect(@term.evaluate()).toBeFalsy()

  it "handles checkbox with function", ->
    @term = new Tabla.JQueryInputTerm(@checkbox, -> true)
    expect(@term.evaluate()).toBeTruthy()
    @checkbox.prop('ckecked', false)
    expect(@term.evaluate()).toBeTruthy()

  it "presents itself nicely with toString()", ->
    term = new J(@checkbox, true)
    expect(term.toString()).toBe("JQueryTerm: checkbox [], value: true, expected value: true")
    term = new J($('<input type="checkbox" />'), true)
    expect(term.toString()).toBe("JQueryTerm: checkbox [], value: false, expected value: true")
    

describe "Tabla.Term", ->
  describe "With binary function", ->
    it "Evaluates to the same value as the fn.", ->
      falseTerm = new Tabla.Term(-> false)
      trueTerm = new Tabla.Term(-> true)
      expect(falseTerm.evaluate()).toBeFalsy()
      expect(trueTerm.evaluate()).toBeTruthy()

describe "Tabla.Rule", ->
  it "is defined.", ->
    expect(Tabla.Rule).toBeDefined()
