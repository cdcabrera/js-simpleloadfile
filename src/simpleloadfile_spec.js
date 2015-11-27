
describe('Module, SimpleLoadFile', function () {

    var injected = {
        method:         window.simpleLoadFile,
        exec:           undefined
    };


    // execute
    beforeEach(function() {

        injected.exec = injected.method('test.js');
    });


    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });


    // does it have methods
    it('should have specific methods', function () {

        expect(injected.exec.update).toBeDefined();

        expect(injected.exec.complete).toBeDefined();

        expect(injected.exec.success).toBeDefined();

        expect(injected.exec.error).toBeDefined();

        expect(injected.exec.wait).toBeDefined();
    });


    // does the defined method allow chained methods
    it('should have chained methods', function () {

        expect(injected.exec.update().success).toBeDefined();

        expect(injected.exec.update().complete).toBeDefined();

        expect(injected.exec.update().success).toBeDefined();

        expect(injected.exec.update().error).toBeDefined();

        expect(injected.exec.update().wait).toBeDefined();
    });

});