'use strict';

var assert = require('assert');

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var chromeDriver = require('selenium-chromedriver');

var port = process.env.NODE_TEST_PORT || 8002;
console.log("port:" + port);
before(function(done) {
    require('./server')(__dirname + '/..', port, done);
    chrome.setDefaultService(
        new chrome.ServiceBuilder(chromeDriver.path).build()
    );
});

beforeEach(function() {
    var driver = this.driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
    this.timeout(10000);
    return driver.get('http://localhost:' + port);
});
afterEach(function() {
    return this.driver.quit();
});

describe("TodoMVC", function() {
    it('visits the web application', function() {
        this.timeout(8000);
        return this.driver.getTitle()
            .then(function(pagetile){
                assert.equal(pagetile,"VanillaJS • TodoMVC");
            });
    });
    it('appends new list items to Todo lits',function(){
        var driver=this.driver;
        this.driver.findElement(webdriver.By.css('input#new-todo'))
            .then(function(el){
                return el.sendKeys('order new SSD',webdriver.Key.ENTER);
            }).then(function(){
                return driver.findElement(webdriver.By.css('#todo-list label'));
            }).then(function(el){
                return el.getText();
            }).then(function(txt){
                assert.equal(txt,'order new SSD'); 
            });
    });
    it('updates the "remain items" counter',function(){
        var driver=this.driver;
        
        this.driver.findElement(webdriver.By.css('input#new-todo'))
            .then(function(el){
                return el.sendKeys('order new SSD',webdriver.Key.ENTER);
            }).then(function(){
                return driver.findElement(webdriver.By.css('#todo-count strong'));
            }).then(function(el){
                return el.getText();
            }).then(function(txt){
                assert.equal(txt,'1'); 
                //assert(true);
            });
            //var remainRe=/(\d+)/;
            //var match= txt.match(remainRe);
            
            //assert(match,'"Remaining Items" contains a number');
            //assert.equal(txt,'1'); 
    });

});


describe("Item delete", function() {
    beforeEach(function() {
        var driver=this.driver;

        return this.driver.findElement(webdriver.By.css('#new-todo'))
        .then(function(el){
            return el.sendKeys('order new SSD',webdriver.Key.ENTER);
        }).then(function(){
            return driver.findElement(webdriver.By.css('#todo-list label'));
        }).then(function(el){
            return driver.actions()
            .mouseMove(el)
            .perform();
            //.then(function(){
            //    return el;
            //});;
        }).then(function(){
            return driver.findElement(webdriver.By.css('.destroy'));
        }).then(function(el){
            return el.click();
        });
    });

    it('removes list item from Todo list',function(){
        return this.driver.findElements(webdriver.By.css('#todo-list label'))
        .then(function(elems){
            assert.equal(elems.length,0);
        })
    });

    it('hides the "remain items" counter when no item remain',function(){
        return this.driver.findElement(webdriver.By.css('#todo-count'))
            .then(function(el){
                return el.isDisplayed();
            }).then(function(val){
                assert(!val); 
            });

    });

});

describe('Item modification',function(){
    beforeEach(function(){
        return this.driver.findElement(webdriver.By.css('#new-todo'))
            .then(function(el){
                return el.sendKeys('order new SSD',webdriver.Key.ENTER);
            });
    });
    it('supports task name modification',function(){
        var driver=this.driver;
        // use dirver.actions()'
        // - doubleClick <-- call this method with the right arguments
        // - sendKeys    <-- call this method with right arguments!
        // - perform();
        // Read the list item with 'element.getText
        // Make sure the text is correct with 'asset.equal'
        return this.driver.findElement(webdriver.By.css('#todo-list label')).
            then(function(newTodo){
            return driver.actions()
                .doubleClick(newTodo)
                .sendKeys('...now!',webdriver.Key.ENTER)
                .perform();
            }).then(function(newTodo){
                return driver.findElement(webdriver.By.css('#todo-list label')) 
            }).then(function(el){
                return el.getText();
            }).then(function(todoText){
                assert.equal(todoText,'order new SSD...now!');
            })
    })

});


