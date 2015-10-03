
describe('Module, Events', function () {

    var injected = {
        method:         events,
        exec:           events,
        check:          undefined
    };


    // execute
    beforeEach(function() {

        injected.check = injected.exec.load( queue.check( processFiles('test.js') ) );
    });


    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });


    // does it have methods
    it('should have specific methods', function () {

        expect(injected.exec.load).toBeDefined();

        expect(injected.exec.next).toBeDefined();
    });


    // does the defined method allow chained methods
    it('should have chained methods', function () {

        expect(injected.exec.load().next).toBeDefined();

        expect(injected.exec.next().load).toBeDefined();
    });

});