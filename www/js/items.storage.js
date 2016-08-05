(function() {

    angular.module('starter').factory('itemsStorage', ['$q', itemsStorage]);

    function itemsStorage($q) {
        var _db;
        var _items;

        return {
            initDB: initDB,
            emptyDB: emptyDB,
            initializeDBStructure: initializeDBStructure,
            addRandomItems: addRandomItems,
            updateItem: updateItem,
            deleteItem: deleteItem,
            getItems: getItems,
            writeToLocalStorage: writeToLocalStorage,
            getLocalStorage: getLocalStorage,
            emptyLocalStorage: emptyLocalStorage
        };

        function initDB() {
            // Creates the database or opens if it already exists
            _db = new PouchDB('stapps', {adapter: 'websql'});
            _db.info().then(console.log.bind(console));
        };

        function writeToLocalStorage (s) {
          window.localStorage["cache"] = s;
        }

        function getLocalStorage () {
          return window.localStorage['cache'];
        }

        function emptyLocalStorage () {
          delete window.localStorage['cache'];
        }

        function emptyDB() {
          return $q.when(_db.destroy().then(function () {
            _db = new PouchDB('stapps', {adapter: 'websql'});
            return _db;
          }));
        };

        function initializeDBStructure() {
          return $q.when(_db.info().then(function (result) {
            if(result.doc_count === 0) {
              console.log('create initial db content');
              $q.when(_db.bulkDocs([{_id:"stappsData.backendConfig"}, {_id: "stappsData.database", all: {}}, {_id: "stappsEvents.synced"}, {_id: "stappsEvents.saved"}, {_id: "stappsSettings.values"}, {_id: "stappsHomeChosenWidgets.chosenWidgets"}, {_id: "stappsHints.hidden"}]));
            }
            else {
              console.log('Database already initialized');
            }
          }));
        }

        function addRandomItems(type, n) {
          var appendRandomItems = function (doc) {
            var randomItem = {};
            for (var i=1; i<=n; i++) {
              console.log(i);
              randomItem = generateRandomItem(type);
              doc.all[randomItem.uid] = randomItem;
            }
            return doc;
          }

          return $q.when(_db.get('stappsData.database')).then(function(doc) {
            console.log('received doc:', doc);
            return appendRandomItems(doc);
          }).then(function (doc) {
            console.log('now going to put doc back into the db', doc);
            return $q.when(_db.put(doc));
          });
        }

        function updateItem(item) {
          return $q.when(_db.get('stappsData.database')).then(function(doc) {
            doc.all[item.uid] = item;
            return doc;
          }).then(function (doc) {
            return $q.when(_db.put(doc));
          });
        }

        function deleteItem(item) {
          return $q.when(_db.get('stappsData.database')).then(function(doc) {
            delete doc.all[item.uid];
            return doc;
          }).then(function (doc) {
            return $q.when(_db.put(doc));
          });
        }

        function getItems(type) {
          var getItemsFromDBObject = function (dbo) {
            var items = [];
            angular.forEach(dbo, function (item) {
              if (item.uid.indexOf(type)!==-1) {
                items.push(item);
              }
            });
            return items;
          }
          return $q.when(_db.get('stappsData.database')).then(function(doc) {
            return getItemsFromDBObject(doc.all);
          }).catch(console.log.bind(console));
        }

        function getAllItems() {
          return $q.when(_db.allDocs({ include_docs: true}))
                    .then(function(docs) {

                      // Each row has a .doc object and we just want to send an
                      // array of objects back to the calling controller,
                      // so let's map the array to contain just the .doc objects.
                      _items = docs.rows.map(function(row) {
                          // Dates are not automatically converted from a string.
                          // row.doc.Date = new Date(row.doc.Date);
                          return row.doc;
                      });

                      // Listen for changes on the database.
                      // _db.changes({ live: true, since: 'now', include_docs: true})
                      //    .on('change', onDatabaseChange);
                     return _items;
                   });
        };

        function generateRandomItem (type) {
          var generatedItem = null;
            switch(type) {
              case 'favorite':
                generatedItem = angular.copy(STAPPS_SAMPLE_FAVORITE);
                break;
              case 'event':
                generatedItem = angular.copy(STAPPS_SAMPLE_EVENT);
                break;
              default:
                generatedItem = angular.copy(STAPPS_SAMPLE_EVENT);
            }
            generatedItem.uid = generatedItem.uid + '-' + generateUUID();
          return generatedItem;
        }

        function findIndex(array, id) {
          var low = 0, high = array.length, mid;
          while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
          }
          return low;
        }

        function generateUUID() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        };
    }
})();
