

    queue = queue();


    /**
     * Check and update wait and loaded queues.
     * @returns {{check: Function, update: Function}}
     */
    function queue () {


        /**
         * Update and return the wait queue.
         * @returns {Array}
         */
        function getWaitQueue() {

            var waitQueues  = internalStorage.get('waitQueues'),//_settings.data.waitQueues,
                loadedIds   = (internalStorage.get('loadedIds')||[]).join(','),//_settings.data.loadedIds.join(','),
                getQueue    = [],
                updatedQueue= [];

            for (var i=0; i<waitQueues.length; i++) {

                var newWait = [];

                for (var k=0; k<waitQueues[i].wait.length; k++) {

                    if (loadedIds.indexOf(waitQueues[i].wait[k]) < 0) {

                        newWait.push(waitQueues[i].wait[k]);
                    }
                }

                waitQueues[i].wait = newWait;

                if (waitQueues[i].wait.length) {

                    updatedQueue.push(waitQueues[i]);

                } else {

                    getQueue.push(waitQueues[i]);
                }
            }

            internalStorage
                .reset('waitQueues')
                .put('waitQueues', updatedQueue);

            return getQueue;
        }


        return {


            /**
             * Check wait queue.
             * @param files {Array}
             * @returns {Array}
             */
            check: function(files) {

                if (!files.length) {

                    files = getWaitQueue();

                    if (!files.length) {

                        return [];
                    }
                }

                if (files[0].wait.length) {

                    internalStorage.put('waitQueues', files[0]);
                    //events.next(null, {type: 'waiting'}, [files[0]]);

                    files.shift();

                    this.check(files);

                    return [];
                }

                return files;
            },


            /**
             * Update loaded files queue.
             * @param fileLoadedId {String}
             */
            update: function(fileLoadedId) {

                internalStorage.put('loadedIds', fileLoadedId);

                return this;
            }
        };
    }