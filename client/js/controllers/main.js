(function () {
    
    //Afina MainController
angular.module('Afina')
    .controller('MainController', MainController);

MainController.$inject = ['$scope'];
function MainController($scope){
    //view model
    var vm = this;
    console.log('initialized main ctrl');

    //переменная для прогресс-бара
    vm.progress = 0;
    vm.progressSoH = 0;
    vm.progressVS = 0;
    vm.showAdditionalBtns = false;
    vm.showAdditionalBtnsStatus = 'Show';
    vm.setAdditionalBtns = setAdditionalBtns;
    vm.isParseComplete = false;
    vm.isParseSoHComplete = false;
    vm.isParseVSComplete = false;
    vm.totalStockQty = 0;
    vm.totalSalesQty = 0;
    
    //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
    vm.exportData = false;
    //массив $scope.data обрабатывается и данные о продажах группируются по дням и сохраняются в эту переменную
    vm.dataByDate = false;    
    $scope.data = false;
    //массив массивов: [0] - заполняется данными об общих продажах за время, [1] и дальше по каждой модели за время. {Date: x, Quantity: y, Name: z} 
    $scope.dataByDate = false;

    $scope.structuredDataSoH = vm.structuredDataSoH = false;
    $scope.haveSalesData = false;
    
    $scope.modelNames = false;
    //only for test
    //$scope.modelNames = ["433 Жакет", "431 Надя", "440 Ася", "435 Вика", "438 Ника", "439 Надя куртка", "417 Вика куртка", "425 Лия", "427 Моника"];
    
    $scope.startEndDates = false;
    //сюда помещаются данные из csv файла сразу после парсинга в виде массивов
    vm.roughData = null;

    //purple, blue, teal, green, orange, orangeRed, red, grey, darkGrey, malin
    $scope.colorsCollection = [        
        "rgba(142, 68, 173",
        "rgba(36, 113, 163",
        "rgba(52, 152, 219",
        "rgba(22, 160, 133",
        "rgba(46, 204, 113",
        "rgba(243, 156, 18",
        "rgba(211, 84, 0",
        "rgba(192, 57, 43",
        "rgba(149, 165, 166",
        "rgba(44, 62, 80",
        "rgba(233, 30, 99",
        "rgba(184, 189, 246",

        "rgba(189, 246, 184",
        "rgba(117, 19, 27",
        "rgba(18, 75, 12",
        "rgba(69, 12, 75",
        "rgba(241, 76, 214",
        "rgba(245, 196, 93",
        "rgba(42, 30, 21"
    ]
    //alizarin, torquoise, cerulean blue, malachite, gold, teal, orangeRed, indigo, azalea, perano,
    //madang, red berry, myrtle, mardi gras, free speech magenta, cream can, cocoa brown
    /*$scope.colorsCollection = [
        "rgba(227, 38, 54",
        "rgba(38, 227, 221",
        "rgba(39, 72, 192",
        "rgba(32, 217, 89",
        "rgba(255, 215, 0",
        "rgba(0, 128, 128",
        "rgba(255, 69, 0",
        "rgba(76, 3, 184",
        "rgba(246, 184, 189",
        "rgba(184, 189, 246",

        "rgba(189, 246, 184",
        "rgba(117, 19, 27",
        "rgba(18, 75, 12",
        "rgba(69, 12, 75",
        "rgba(241, 76, 214",
        "rgba(245, 196, 93",
        "rgba(42, 30, 21"
    ]*/

    /*метод принимает файл выбранный в input[id="fileOpener"], файл должен быть только по шаблону от TradeGecko Exporter
    *парсит csv в json с помощью papaParse.js, если парсинг проходит успешно - вызывается функция 'complete'         
    */
    vm.tryParseFile = tryParseFile;
    function tryParseFile() {
        var file = document.getElementById("fileOpener").files[0];

        setProgress(0);
        

            Papa.parse(file, {
                //complete - функция, которая срабатыват, когда парсинг прошел успешно
                complete: function (results) {                    
                    vm.roughData = results.data;
                    console.log('file have been parsed');

                    setProgress(30);
                    

                    let promise = new Promise((resolve, reject) => {
                        
                        if (getJsonData()) {
                            setTimeout(resolve, 150);
                                                        
                            setProgress(50);                            

                        } else {
                            reject("error in promise getJsonData()!");
                        }                       

                    });

                    promise.then(() => {
                        setTimeout(getDataByDate, 300, false); //3-rd arg for isDays

                        setProgress(70);
                        
                    }, error => console.log(error));

                }
            });
    };
    function tryParseSoHFile() {
        var file = document.getElementById("fileOpenerStockOnHand").files[0];        

        setSoHProgress(0);

        Papa.parse(file, {
            complete: function (results) {

                setSoHProgress(11);

                //array of csv data
                var roughData = results.data;
                //console.log(results.data);

                var validation = true;

                //array == ["Product", "Variant", "SKU", "In Stock", "Cost Price"]
                var propertiesNames = roughData[0];
                //console.log(propertiesNames);

                setSoHProgress(27);

                var jsonData = [];
                jsonData = getJsonDataSoH(roughData);
                //console.log(jsonData);

                if (validation) {
                    setSoHProgress(56);    
                } else {
                    console.log("crit error in validation 56%");
                    return;
                }

                var structuredData = [];
                $scope.structuredDataSoH = vm.structuredDataSoH = structuredData = getStructuredData(jsonData);
                //console.log(structuredData);

                if (validation) {
                    setSoHProgress(100);
                } else {
                    console.log("crit error in validation 100%");
                    return;
                }


                //this method transforms array data to json data
                function getJsonDataSoH(arr) {

                    //array of objects
                    var resultArr = [];
                    var tempObj = new Object();
                    var iterator = 0;
                    var totalStock = 0;
                    var validPts = 0;

                    for (var i = 1; i < arr.length - 1; i++) {

                        tempObj = new Object();
                        iterator = 0;

                        for (var p of propertiesNames) {

                            if (p == "Variant") {

                                getColorAndSize(tempObj, arr[i][iterator]);
                                validPts < 1 ? validPts = 1 : null;

                            } else {
                                if (p == "In Stock") {

                                    //getInStock(tempObj, arr[i][iterator]);
                                    tempObj.InStock = parseInt(arr[i][iterator]);
                                    validPts < 2 ? validPts = 2 : null;

                                } else {

                                    tempObj[p] = arr[i][iterator];

                                }
                            }
                            iterator++;

                            if (p == "Stock on Hand" || p == "Sales Volume") {
                                validation = false;
                                return;
                            }
                        }
                        tempObj.Sold = 0;
                        totalStock += tempObj.InStock;
                        
                        resultArr.push(tempObj);
                    }

                    if (validPts == 2) {
                        vm.totalStockQty = totalStock;
                        validation = true;
                        //console.log(resultArr);
                        return resultArr;
                    } else {
                        validation = false;
                        console.log("crit error in getJsonDataSoH() validPts");
                        return null;
                    }
                    

                    function getColorAndSize(tObject, val) {
                        var colorDashSize = val;
                        var dashIndex = 0;
                        var spaceIndex = 0;

                        for (var i = 0; i < colorDashSize.length; i++) {

                            if (colorDashSize[i] == '/') {
                                dashIndex = i;
                                break;
                            }
                        }

                        tObject.Color = colorDashSize.slice(spaceIndex, dashIndex);
                        tObject.Size = colorDashSize.slice(dashIndex + 1);
                    }
                    function getInStock(tObject, val) {
                        tObject.InStock = parseInt(val);
                    };
                }
                function getStructuredData(arr) {
                    var resultArr = [[[arr[0]]]];

                    for (var i = 1; i < arr.length; i++) {
                        findModel(resultArr, arr[i]);
                    }

                    return resultArr;

                    function findModel(rArr, m) {
                        for (var x = 0; x < rArr.length; x++) {
                            if (rArr[x][0][0].Product == m.Product) {
                                findColor(rArr[x], m);
                                return;
                            }
                            if (x == rArr.length - 1) {
                                rArr.push([[m]]);
                                return;
                            }
                        }

                        console.log('error in findModel() SoH');
                        function findColor(ar, mo) {
                            for (var i = 0; i < ar.length; i++) {

                                if (ar[i][0].Color == mo.Color) {
                                    ar[i].push(mo);
                                    return;
                                }
                                if (i == ar.length - 1) {
                                    ar.push([mo]);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        });
    };
    function tryParseVSFile() {
        var file = document.getElementById("fileOpenerVariantSales").files[0];

        setVSProgress(0);

        Papa.parse(file, {
            complete: function (results) {

                setVSProgress(11);

                //array of csv data
                var roughData = results.data;

                var validation = false;
                setVSProgress(27);

                //array == ["Product", "Variant", "SKU", "In Stock", "Cost Price"]
                var propertiesNames = roughData[0];
                //console.log(propertiesNames);

                var jsonData = [];
                jsonData = getJsonDataVS(roughData);
                //console.log(jsonData);

                if (validation) {
                    setVSProgress(55);
                } else {
                    console.log('crit error in validation 55%');
                    return;
                }
                
                //console.log('-----------------------------------------------');
                for (var x = 0; x < jsonData.length; x++) {
                    fillStructuredData(vm.structuredDataSoH, jsonData[x]);
                }
                //console.log('-----------------------------------------------');

                if (validation) {
                    setVSProgress(100);
                    $scope.haveSalesData = true;
                    //console.log(vm.structuredDataSoH);
                } else {
                    console.log('crit error in validation 100%');
                    return;
                }
                

                function getJsonDataVS(arr) {

                    //array of objects
                    var resultArr = [];
                    var tempObj = new Object();
                    var iterator = 0;

                    for (var i = 1; i < arr.length - 1; i++) {

                        tempObj = new Object();
                        iterator = 0;

                        for (var p of propertiesNames) {

                            if (p == "Sales Volume") {
                                //getInStock(tempObj, arr[i][iterator]);
                                tempObj.Sold = parseInt(arr[i][iterator]);
                                validation = true;
                            } else {
                                tempObj[p] = arr[i][iterator];
                            }
                            iterator++;
                        }

                        resultArr.push(tempObj);
                    }

                    return resultArr;                                        
                }
                function fillStructuredData(arr, d) {

                    for (var i = 0; i < arr.length; i++) {
                        for (var j = 0; j < arr[i].length; j++) {
                            for (var k = 0; k < arr[i][j].length; k++) {                               

                                if (d.SKU == arr[i][j][k].SKU) {
                                    arr[i][j][k].Sold = d.Sold;

                                    vm.totalSalesQty += d.Sold;
                                    return;
                                }
                            }
                        }
                    }
                    validation = false;
                    console.log('error in fillStructuredData()');
                }
            }
        });
    }

    //массив $scope.data обрабатывается и данные о продажах группируются по дням и сохраняются в vm.dataByDate
    vm.getDataByDate = getDataByDate;
    //метод принимает $scope.data, массив должен быть отсортирован по убыванию ShipmentDate, поле ShipmentDate должно иметь значения формата 2016-05-19
    //метод заполняет массив $scope.dataByDate объектами с полями даты и кол-ва проданных изделий за каждый из дней
    function getJsonData() {

        selectTargetColumns();
        $scope.modelNames = distinctModels();
        
        return true;
        //в csv файле по шаблону TradeGecko Exportera больше 20 колонок, эта функция отделяет зерна от плевел
        function selectTargetColumns() {
            //массив нужных названий колонок, в дальнейшем этот массив сопоставляется с названием каждой колонки в файле
            var targetColumns = ['Variant SKU', 'Item Product', 'Item Name', 'Item Quantity', 'Shipment Date'];
            //массив названий колонок из csv файла
            var header = vm.roughData[0];

            var indexes = getHeaderIndexes(targetColumns);
            //$scope.$apply(function () {
            //    setProgress(30);
            //});

            var data = getJsonObjects(vm.roughData);
            //$scope.$apply(function () {
            //    setProgress(45);
            //});
            vm.exportData = data;
            $scope.data = data;
            //$scope.$apply();
            console.log('JSON Data:');
            console.log(data);
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

                    if (tempObject[targetColumns[1]] == '') {
                        console.log('error: tempObject[targetColumns[1]] == \'\'');
                        continue;
                    }

                    newObject.Name = tempObject[targetColumns[1]];
                    newObject.SKU = tempObject[targetColumns[0]];
                    newObject.Quantity = parseInt(tempObject[targetColumns[3]]);
                    newObject.Date = new Date(tempObject[targetColumns[4]]).setHours(12) || tempObject[targetColumns[4]];

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
    function getDataByDate(isDays) {
        if (vm.exportData == false) {
            console.log('Сначала импортируйте данные о продажах!');
            return
        }        
        
        var arr = $scope.data;
        var result = [[]];
        var count = arr[0].Quantity;
        var dates = getStartEndDates(arr);
        var tempDate = dates.start;

        //console.log(dates);
                
        var modelsName = $scope.modelNames;
        
        if (isDays) {
            //создаем массивы заполненные датами от первой даты продаж до последней в arr[]
            //[0] - сумма продаж по всем моделям, [1],[2],[3]... - сумма продаж по каждой из моделей в отдельности
            for (var k = 0; k < modelsName.length + 1; k++) {
                result[k].push({ Date: tempDate, Quantity: 0, Name: modelsName[k - 1] || '' });

                var iterator = 0;
                do {
                    tempDate = addDays(tempDate);
                    result[k].push({ Date: tempDate, Quantity: 0, Name: modelsName[k - 1] || '' });
                    if (iterator > 1000) {
                        console.log("error: iterator > 10 000!");
                        break;
                    }
                    iterator++;
                } while (!compareDate(tempDate, dates.end));

                if (modelsName.length != k) {
                    tempDate = new Date(arr[arr.length - 1].Date);
                    tempDate.setHours(12);
                    result.push([]);
                }
                tempDate = dates.start;
            }

        } else {
            //создаем массивы заполненные датами от первой даты продаж до последней в arr[]
            //[0] - сумма продаж по всем моделям, [1],[2],[3]... - сумма продаж по каждой из моделей в отдельности
            for (var k = 0; k < modelsName.length + 1; k++) {
                result[k] = getWeeksArray(dates, modelsName[k - 1] || '');
                /*result[k].push({ Date: tempDate, Quantity: 0, Name: modelsName[k - 1] || '' });

                var iterator = 0;
                do {
                    tempDate = addDays(tempDate);
                    result[k].push({ Date: tempDate, Quantity: 0, Name: modelsName[k - 1] || '' });
                    if (iterator > 1000) {
                        console.log("error: iterator > 10 000!");
                        break;
                    }
                    iterator++;
                } while (!compareDate(tempDate, dates.end));

                if (modelsName.length != k) {
                    tempDate = new Date(arr[arr.length - 1].Date);
                    tempDate.setHours(12);
                    result.push([]);
                }
                tempDate = dates.start;*/
            }
        }
        console.log("getDataByDate() после заполнения массива датами");
        console.log(result);
        function getWeeksArray(d, n) {


            var startWeekDate = null;
            var tempWeekDate = null;
            var startYearDate = new Date(d.start);
            var weekNo = 1;
            var weeksArray = [];
            startYearDate.setDate(1);
            startYearDate.setMonth(0);

            tempWeekDate = new Date(startYearDate.setDate(1 - startYearDate.getDay()));

            while (tempWeekDate < d.end) {

                tempWeekDate.setDate(tempWeekDate.getDate() + 7);

                if (tempWeekDate > d.start) {

                    if (startWeekDate == null) {
                        startWeekDate = new Date(tempWeekDate);

                        startWeekDate.setDate(startWeekDate.getDate() - 7);


                        weeksArray.push({
                            Date: new Date(startWeekDate),
                            Name: n,
                            Quantity: 0
                        });
                    }

                    weeksArray.push({
                        Date: new Date(tempWeekDate),
                        Name: n,
                        Quantity: 0
                    });
                }

                if (weekNo > 276) {
                    console.log('error: quantity of weeks is bigger than 276!');
                    break;
                }

                weekNo++;
            }

            return weeksArray;
        }
        
        //$scope.$apply(function () {
        //    setProgress(65);
        //});

        for (var i = 0; i < arr.length; i++) {
            addDateToResultArr(arr[i]);
            count += arr[i].Quantity;
        }

        //$scope.$apply(function () {
        //    setProgress(85);
        //});

        makeShortDate();
        vm.dataByDate = result;
        $scope.dataByDate = result;
        //console.log(result);
        console.log(count);
        console.log('Data by Date:');
        console.log(result);
             
        setProgress(100);        

        function addDateToResultArr(obj) {
            var tempDate = new Date(obj.Date);
            
            if (isDays) {
                for (var j = 0; j < result[0].length; j++) {

                    //заполняем result[0] - массив с суммой всех продаж по времени
                    if (compareDate(tempDate, result[0][j].Date)) {
                        result[0][j].Quantity += obj.Quantity;

                        //заполняем result[1...] массивы с продажами по моделям по времени
                        for (var k = 1; k < modelsName.length + 1; k++) {

                            if (obj.Name == modelsName[k - 1]) {

                                result[k][j].Quantity += obj.Quantity;
                                return;
                                //if (compareDate(tempDate, result[k][j].Date)) {

                                //}
                                //if (j == result[k].length - 1) {
                                //    console.log(tempDate);
                                //    console.log(result[k][j].Date);
                                //    console.log('error in addDateToResultArr()!');
                                //}
                                //break;
                            }
                            if (k == modelsName.length) {
                                console.log('error in second part of addDateToResultArr()!');
                            }
                        }

                        return;
                    }
                    if (j == result[0].length - 1) {
                        console.log(tempDate);
                        console.log(result[0][j].Date);
                        console.log('error in addDateToResultArr()!');
                    }
                }
            } else {

                for (var j = 0; j < result[0].length; j++) {

                    //заполняем result[0] - массив с суммой всех продаж по времени
                    if (result[0][j].Date <= tempDate && result[0][j + 1].Date > tempDate) {
                        result[0][j].Quantity += obj.Quantity;

                        //заполняем result[1...] массивы с продажами по моделям по времени
                        for (var k = 1; k < modelsName.length + 1; k++) {

                            if (obj.Name == modelsName[k - 1]) {

                                result[k][j].Quantity += obj.Quantity;
                                return;
                                //if (compareDate(tempDate, result[k][j].Date)) {

                                //}
                                //if (j == result[k].length - 1) {
                                //    console.log(tempDate);
                                //    console.log(result[k][j].Date);
                                //    console.log('error in addDateToResultArr()!');
                                //}
                                //break;
                            }
                            if (k == modelsName.length) {
                                console.log('error in second part of addDateToResultArr()!');
                            }
                        }

                        return;
                    }

                    if (j == result[0].length - 1) {
                        console.log(tempDate);
                        console.log(result[0][j].Date);
                        console.log('error in addDateToResultArr()!');
                    }
                }
            }
                        
        }
        function addDays(date) {
            var result = new Date(date);
            result.setDate(result.getDate() + 1);
            result.setHours(12);
            return result;
        }
        function compareDate(dOne, dTwo) {
            dOne = new Date(dOne);
            dTwo = new Date(dTwo);
            
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
            //console.log('----------------------');
            //console.log(dOne);
            //console.log(dTwo);
            //console.log(r);
            //console.log('----------------------');
            console.log('error in compareDate()');
        }
        function makeShortDate() {
            var temp = [];
            for (var i = 0; i < result.length; i++) {
                for (var k = 0; k < result[i].length; k++) {
                    temp = [
                    result[i][k].Date.getFullYear(),
                    result[i][k].Date.getMonth() + 1,
                    result[i][k].Date.getDate()]
                    .join('-');
                    result[i][k].Date = temp;
                }
                
            }
        }
        function getStartEndDates(a) {            

            var start = new Date(a[0].Date);
            var end = new Date(a[a.length-1].Date);

            for (var i = 0; i < a.length; i++) {
                if (start > a[i].Date) {
                    start = a[i].Date;
                }
                if (end < a[i].Date) {
                    end = a[i].Date;
                }
            }

            start = new Date(start);
            start.setHours(12);
            end = new Date(end);
            end.setHours(12);
            
            $scope.startEndDates = { start: start, end: end };
            return { start: start, end: end };
        }
        
    }
    function distinctModels() {

        var arr = $scope.data;
        var res = [];
        res.push(arr[0].Name);

        for (var i = 0; i < arr.length; i++) {

            for (var j = 0; j < res.length; j++) {

                if (res[j] == arr[i].Name || arr[i].Name == '') {
                    break;
                }

                if (j == res.length - 1) {
                    res.push(arr[i].Name);
                    break;
                }
            }

        }
        console.log(res);
        $scope.modelNames = res;
        return res;
    }
    function setProgress(x) {        
        $scope.$apply(function () {
            vm.progress = x;
            //console.log('progress is: ' + vm.progress);
            x == 100 ? vm.isParseComplete = true : vm.isParseComplete = false;
        });
    }
    function setSoHProgress(x) {
        $scope.$apply(function () {
            vm.progressSoH = x;
            //console.log('progress is: ' + vm.progress);
            x == 100 ? vm.isParseSoHComplete = true : vm.isParseSoHComplete = false;
        });
    }
    function setVSProgress(x) {
        $scope.$apply(function () {
            vm.progressVS = x;
            //console.log('progress is: ' + vm.progress);
            x == 100 ? vm.isParseVSComplete = true : vm.isParseVSComplete = false;
        });
    }
    function setAdditionalBtns() {
        if (vm.showAdditionalBtns == true) {
            vm.showAdditionalBtns = false;
            vm.showAdditionalBtnsStatus = 'Show';
        } else {
            vm.showAdditionalBtns = true;
            vm.showAdditionalBtnsStatus = 'Hide';
        }
    }
    
    $(document).ready(function () {
        $('#soho').change(function () {
            console.log('soho');
                        
            var input = $('#soho'),
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            console.log(label);

            var inputSec = $('#sohoSec');
            inputSec.val(label);

            setSoHProgress(0);
            tryParseSoHFile();

        });
    });   
    

    $(document).ready(function () {
        $('#fileOpener').change(function () {
            console.log('inputs content have changed');

            var input = $('#fileOpener'),
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            //console.log(label);

            var inputSec = $('#fileOpenerInp');
            inputSec.val(label);

            setProgress(0);
            tryParseFile();            
        });
        
    });
    $(document).ready(function () {
        $('#fileOpenerStockOnHand').change(function () {
            console.log('inputs SoH content have changed');

            var input = $('#fileOpenerStockOnHand'),
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            //console.log(label);

            var inputSec = $('#fileOpenerStockOnHandInp');
            inputSec.val(label);

            setSoHProgress(0);
            tryParseSoHFile();
        });

    });
    $(document).ready(function () {
        $('#fileOpenerVariantSales').change(function () {
            console.log('inputs VS content have changed');

            var input = $('#fileOpenerVariantSales'),
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            //console.log(label);

            var inputSec = $('#fileOpenerVariantSalesInp');
            inputSec.val(label);

            setVSProgress(0);
            tryParseVSFile();
        });

    });
    $(document).ready(function () {
        $('#checkData').click(function () {
            console.log($('#file'));
            console.log($('#fileOpener'));
            tryParseFile();


        });

    });
    $(document).ready(function () {
        $('#getJsonData').click(function () {
            getJsonData();
        });

    });
    $(document).ready(function () {
        $('#getDataByDate').click(function () {
            getDataByDate();
        });

    });
      
}
})();