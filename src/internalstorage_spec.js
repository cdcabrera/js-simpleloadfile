
describe('Module, Storage', function () {



    var injected = {
        method:         InternalStorage,
        exec:           new InternalStorage()
    };



    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });



    // does it have methods
    it('should have specific methods', function () {

        expect(injected.exec.all).toBeDefined();

        expect(injected.exec.get).toBeDefined();

        expect(injected.exec.put).toBeDefined();

        expect(injected.exec.reset).toBeDefined();
    });



    // does the defined method allow chained methods
    it('should have chained methods', function () {

        expect(injected.exec.put().reset).toBeDefined();

        expect(injected.exec.reset().put).toBeDefined();
    });



    // does it return a global object
    it('should return a global object containing internal data', function () {

        var obj = injected.exec.all();

        expect(obj).toBeDefined();

        expect(obj.filesLoaded).toBeDefined();

        expect(obj.filesFailed).toBeDefined();

        expect(obj.loadedIds).toBeDefined();

        expect(obj.waitQueues).toBeDefined();
    });

});