(function () {
    
    //Afina MainController
angular.module('Afina')
    .controller('MainController', MainController);

MainController.$inject = ['$scope'];
function MainController($scope){
    //view model
    var vm = this;
    console.log('initialized main ctrl');


    //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
    vm.exportData = false;
    //массив $scope.data обрабатывается и данные о продажах группируются по дням и сохраняются в эту переменную
    vm.dataByDate = false;
    $scope.data = false;
    $scope.dataByDate = false;

    //сюда помещаются данные из csv файла сразу после парсинга в виде массивов
    vm.roughData = null;
    /*метод принимает файл выбранный в input[id="fileOpener"], файл должен быть только по шаблону от TradeGecko Exporter
    *парсит csv в json с помощью papaParse.js, если парсинг проходит успешно - вызывается функция 'complete'         
    */
    vm.tryParseFile = tryParseFile;
    function tryParseFile() {
            var file = document.getElementById("fileOpener").files[0];

            Papa.parse(file, {
                //complete - функция, которая срабатыват, когда парсинг прошел успешно
                complete: function (results) {                    
                    vm.roughData = results.data;
                    console.log('file have been parsed');

                    selectTargetColumns();
                    //в csv файле по шаблону TradeGecko Exportera больше 20 колонок, эта функция отделяет зерна от плевел
                    function selectTargetColumns() {
                        //массив нужных названий колонок, в дальнейшем этот массив сопоставляется с названием каждой колонки в файле
                        var targetColumns = ['Variant SKU', 'Item Product', 'Item Name', 'Item Quantity', 'Shipment Date'];
                        //массив названий колонок из csv файла
                        var header = vm.roughData[0];

                        var indexes = getHeaderIndexes(targetColumns);
                        var data = getJsonObjects(vm.roughData);
                        vm.exportData = data;
                        $scope.data = data;
                        $scope.$apply();

                        /*возвращает индексы нужных нам колонок в массиве всего csv файла, т е из 20 колонок он вернет 5 цифр,
                         * к примеру, [1, 4, 6, 12, 15] - это и будут номера нужных нам колонок в массиве vm.roughData */
                        function getHeaderIndexes(targCol) {
                            var indexes = [];
                            for (var i = 0; i < header.length; i++) {
                                for (var j = 0; j < targCol.length; j++) {
                                    if (header[i] == targCol[j]) {
                                        indexes.push(i);
                                        break;
                                    }
                                }
                                if (indexes.length == targCol.length) {
                                    break;
                                }
                            }
                            return indexes;
                        }
                        /*функция принимает vm.roughData как необработанный массив данных, отделяет от него только нужные колонки
                         * создает объект и помещает в его свойства значения из нужных колонок, возвращает массив объектов*/
                        function getJsonObjects(arr) {
                            var objects = [];
                            var tempObject = new Object();
                            var newObject = new Object();

                            for (var i = 1; i < arr.length; i++) {
                                tempObject = new Object();
                                newObject = new Object();

                                if (arr[i][indexes[0]] == undefined) {
                                    break;
                                }

                                for (var j = 0; j < indexes.length; j++) {

                                    tempObject[arr[0][indexes[j]]] = arr[i][indexes[j]];
                                }

                                newObject.Name = tempObject[targetColumns[1]];
                                newObject.SKU = tempObject[targetColumns[0]];
                                newObject.Quantity = parseInt(tempObject[targetColumns[3]]);
                                newObject.Date = tempObject[targetColumns[4]];

                                function getColorAndSize() {
                                    var colorDashSize = tempObject[targetColumns[2]];
                                    var dashIndex = 0;

                                    for (var i = 0; i < colorDashSize.length; i++) {
                                        if (colorDashSize[i] == '/') {
                                            dashIndex = i;
                                            break;
                                        }
                                    }

                                    newObject.Color = colorDashSize.slice(0, dashIndex);
                                    newObject.Size = colorDashSize.slice(dashIndex + 1);
                                }

                                getColorAndSize();

                                objects.push(newObject);
                            }

                            //console.log(objects);
                            return objects;
                        }
                    }
                }
            });
    };

    //массив $scope.data обрабатывается и данные о продажах группируются по дням и сохраняются в vm.dataByDate
    vm.getDataByDate = getDataByDate;
    function getDataByDate() {
        if (vm.exportData == false) {
            return
        }

        var arr = $scope.data;
        var result = [{ Date: arr[0].Date, Quantity: arr[0].Quantity }];


        for (var i = 1; i < arr.length; i++) {
            addDateToResultArr(arr[i]);
        }

        vm.dataByDate = result;
        $scope.dataByDate = result;

        function addDateToResultArr(obj) {
            for (var j = 0; j < result.length; j++) {
                if (obj.Date == result[j].Date) {
                    result[j].Quantity += obj.Quantity;
                    return;
                }
                if (j == result.length - 1) {
                    result.push({ Date: obj.Date, Quantity: obj.Quantity });
                    return;
                }
            }            
        }
    }
}
})();
    

    
