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
    //массив vm.sDataByDate заполняется массивами данных по месяцам, которые заполняются данными по каждому дню, даже в случае отсутствия продаж в этот день
    vm.sDataByDate = false;
    $scope.data = false;
    $scope.dataByDate = false;
    $scope.sDataByDate = false;

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
    //метод принимает $scope.data, массив должен быть отсортирован по убыванию ShipmentDate, поле ShipmentDate должно иметь значения формата 2016-05-19
    //метод заполняет массив $scope.dataByDate объектами с полями даты и кол-ва проданных изделий за каждый из дней
    function getDataByDate() {
        if (vm.exportData == false) {
            console.log('Сначала импортируйте данные о продажах!');
            return
        }
        
        var arr = $scope.data;
        var result = [];
        var count = arr[0].Quantity;
        
        var startDate = new Date(arr[arr.length - 1].Date);
        startDate.setHours(12);
        var endDate = new Date(arr[0].Date);
        endDate.setHours(12);
        var tempDate = new Date(arr[arr.length - 1].Date);               
        tempDate.setHours(12);

        console.log(1);

        result.push({ Date: tempDate, Quantity: 0 });
        do {
            tempDate = addDays(tempDate);
            result.push({ Date: tempDate, Quantity: 0 });
        } while (!compareDate(tempDate, endDate));
        
        console.log(2);
        for (var i = 0; i < arr.length; i++) {
            addDateToResultArr(arr[i]);
            count += arr[i].Quantity;
        }
        console.log(3);
        makeShortDate();
        console.log(4);
        vm.dataByDate = result;
        $scope.dataByDate = result;
        console.log(count);
             
        function addDateToResultArr(obj) {
            var tempDate = new Date(obj.Date);
            
            for (var j = 0; j < result.length; j++) {

                if (compareDate(tempDate, result[j].Date)) {
                    result[j].Quantity += obj.Quantity;
                    return;
                }
                if (j == result.length - 1) {
                    console.log(tempDate);
                    console.log(result[j].Date);
                    console.log('error in addDateToResultArr()!');
                }
            }            
        }
        function addDays(date) {
            var result = new Date(date);
            result.setDate(result.getDate() + 1);
            return result;
        }
        function compareDate(dOne, dTwo) {

            var ddOne = dOne.getDate();
            var mmOne = dOne.getMonth();
            var yyyyOne = dOne.getYear();

            var ddTwo = dTwo.getDate();
            var mmTwo = dTwo.getMonth();
            var yyyyTwo = dTwo.getYear();

            if (ddOne == ddTwo) {
                if (mmOne == mmTwo) {
                    if (yyyyOne == yyyyTwo) {
                        return true;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
            console.log('error in compareDate()');
        }
        function makeShortDate() {
            var temp = [];
            for (var i = 0; i < result.length; i++) {
                temp = [
                    result[i].Date.getFullYear(),
                    result[i].Date.getMonth() + 1,
                    result[i].Date.getDate()]
                    .join('-');
                result[i].Date = temp;
            }
        }
    }    
}
})();