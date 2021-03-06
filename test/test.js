'use strict';

var helper    = require('./helper')
  , should    = require('should')

var browser

before(function(done) {
    helper.getBrowser(function(driver) {
        browser = driver
        done()
    })
})

beforeEach(function(done) {
    browser.get('http://127.0.0.1:8080/test/test.html')
        .then(function() { done() })
})

after(function(done) {
    browser.quit().then(function() {
        helper.stopServer(done)
    })
})

describe('Lookups', function() {
    
  it('Performs a simple lookup', function(done) {

    browser.element('#test1').sendKeys('M')
    browser.elements('div.autocomplete div').count(function(length) {
      length.should.equal(0)
    })
    browser.element('#test1').sendKeys('a')
    browser.elements('div.autocomplete div').count(function(length) {
      length.should.equal(2)
    })
    browser.element('div.autocomplete div').html(function(html) {
      html.should.equal('<strong>Ma</strong>rch')
    })
    browser.element('#test1').sendKeys('r')
    browser.elements('div.autocomplete div').count(function(length) {
      length.should.equal(1)
    })
    browser.element('div.autocomplete div').html(function(html) {
      html.should.equal('<strong>Mar</strong>ch')
      done()
    })
  })
  
  it('Adds \'selected\' CSS class when item selected with down arrow', function(done) {
    browser.element('#test1').sendKeys('March')
    browser.elements('div.autocomplete div').count(function(length) {
      length.should.equal(1)
    })

    browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
    browser.element('div.autocomplete div.selected').html(function(html) {
        html.should.include('<strong>March</strong>')
        done()
    })
  })

})

describe('Autocomplete fill', function() {
  
    it('Updates text box as I select values with arrow keys', function(done) {
        browser.element('#test1').sendKeys('Ma')
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
        })
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        browser.input('#test1').value(function(value) {
            value.should.equal('May')
        })
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_UP)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
            done()
        }) 
    })
    
    it('Updates text box when clicking a value', function(done) {
        browser.element('#test1').sendKeys('Mar')
        browser.element('div.autocomplete div[title="March"]').click()
        browser.input('input#test1').value(function(value) {
            value.should.equal('March')
            done()
        })
    })
    
    it('Leaves autofill in place when I press space after highlighting', function(done) {
        browser.element('#test1').sendKeys('Ma')
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        browser.element('#test1').sendKeys(helper.Webdriver.Key.SPACE)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
            done()
        })
    })
    
    it('Adds autocomplete when I select entry and hit enter', function(done) {
        browser.element('#test1').sendKeys('Ma')
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ENTER)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
            done()
        })
    })
    
    it('Adds autocomplete when I select entry and hit return', function(done) {
        browser.element('#test1').sendKeys('Ma')
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        browser.element('#test1').sendKeys(helper.Webdriver.Key.RETURN)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
            done()
        })
    })
    
    /* Firefox seems to like RETURN, phantomjs likes ENTER, so send both */
    it('Hitting enter when there\'s only one option adds that meeting', function(done) {
        browser.element('#test1').sendKeys('Mar')
        browser.elements('div.autocomplete div').count(function(length) {
          length.should.equal(1)
        })
        browser.element('#test1').sendKeys(helper.Webdriver.Key.RETURN + helper.Webdriver.Key.ENTER)
        browser.input('#test1').value(function(value) {
            value.should.equal('March')
            done()
        })
    })
    
})

describe('Display', function() {

    it('Can be dismissed with ESC key', function(done) {
        browser.element('#test1').sendKeys('Ma')
        browser.elements('div.autocomplete div').count(function(length) {
          length.should.equal(2)
        })
        browser.element('#test1').sendKeys(helper.Webdriver.Key.ESCAPE)
        helper.wait(browser, 10)
        browser.element('div.autocomplete').isDisplayed(function(displayed) {
            displayed.should.be.false
            done()
        })
    })
    
})

describe('Substituting different data', function() {

    it('Displays both \'search\' and \'data\' when used', function(done) {
        browser.element('#test2').sendKeys('Ma')
        browser.elements('div.autocomplete div').count(function(length) {
          length.should.equal(2)
        })
        browser.elements('div.autocomplete div').get(0, function(element) {
            element.html(function(html) {
                html.should.include('<strong>Ma</strong>rch (3rd month)')
            })
        })
        browser.elements('div.autocomplete div').get(1, function(element) {
            element.html(function(html) {
                html.should.include('<strong>Ma</strong>y (5th month)')
                done()
            })
        })
    })
    
    it('Substitutes alternative values', function(done) {
        browser.element('#test2').sendKeys('Mar')
        browser.element('#test2').sendKeys(helper.Webdriver.Key.RETURN + helper.Webdriver.Key.ENTER)
        browser.input('#test2').value(function(value) {
            value.should.equal('3rd month')
            done()
        })
    })
    
    it('If option is selected and space is pressed then alternative data substitution takes place', function(done) {
        browser.element('#test2').sendKeys('Ma')
        browser.element('#test2').sendKeys(helper.Webdriver.Key.ARROW_DOWN)
        
        browser.input('#test2').value(function(value) {
            value.should.equal('March')
        })
        browser.element('div.autocomplete div.selected').html(function(html) {
            html.should.equal('<strong>Ma</strong>rch (3rd month)')
        })
        browser.element('#test2').sendKeys(helper.Webdriver.Key.SPACE)
        browser.input('#test2').value(function(value) {
            value.should.equal('3rd month')
            done()
        })
    })
        
})

describe('HTML', function() {
    
    it('Adds identifier if requested', function(done) {
        browser.element('div[data-identifier="month-selector"]').then(
            function() { done() },
            function() { done('Identifier not added') }
        )
    })
    
})

