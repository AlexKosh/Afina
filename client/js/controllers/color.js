(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('ColorsController', ColorsController);

    ColorsController.$inject = ['$scope'];
    function ColorsController($scope) {

        //view model
        var vm = this;
        console.log('initialized colors ctrl');

        //navs
        vm.showOrHideThisChart = showOrHideThisChart;
        vm.navArr = [];
        vm.showNav = false;
        vm.showNavStatus = 'Show';
        vm.getInfoInConsole = getInfoInConsole;
        vm.showAdditionalNavBtns = showAdditionalNavBtns;
        vm.isMultipleView = false;
        vm.multipleStatus = 'On';
        vm.setMultipleView = setMultipleView;        

        vm.data = [];
        vm.modelNames = [];
        vm.startEndDates = {};
        vm.dataBySizes = [];
        vm.dataBySizesInWeeks = [];
        //bars
        vm.dataBySizesinBars = [];
        
        vm.CtxArr = {};
        vm.ChrtArr = {};

        vm.chartData = { line: {}, bar: {}};
        //bars
        vm.CtxArrBar = {};
        vm.ChrtArrBar = {};

        vm.dateLabelsArray = [];
        //bars
        vm.sizeLabelsArray = [];

        //for test only
        vm.colorPalettes = {};
        var colorsArrayForPalette = [];
        //var colorsArrayForPalette = ["Жемчуг", "Лаванда", "Пудра", "Синий", "Капучино", "Мята", "Корал", "Сирень", "Малина", "Вишня", "Персик", "Лимон", "Черный"];
        //for (var x = 0; x < colorsArrayForPalette.length; x++) {
        //    vm.colorPalettes[colorsArrayForPalette[x]] = '';
        //}        
        
        //vm.colorPalettes = {
        //    Жемчуг: "Жемчуг", Лаванда: "Лаванда", Пудра: "Пудра", Синий: "Синий", Капучино: "Капучино",
        //    Вишня: "Вишня", Корал: "Корал", Лимон: "Лимон", Малина: "Малина", Мята: "Мята", Персик: "Персик",
        //    Сирень: "Сирень", Черный: "Черный"
        //};

        vm.getDataBySizes = getDataBySizes;
        vm.initAllCanvas = initAllCanvas;
        vm.clearAllCanvas = clearAllCanvas;
        vm.fillAllCharts = fillAllCharts;

        init();
        
        function init() {
            checkData();            
            vm.navArr[0] = true;
            makeCharts();
        }
        function checkData() {
            var string = '';
            var needMain = false;

            $scope.$parent.data != false ? vm.data = $scope.$parent.data : backToMain('error: vm.data == undefined!');
            $scope.$parent.modelNames != false ? vm.modelNames = $scope.$parent.modelNames : backToMain('error: vm.modelNames == undefined!');
            $scope.$parent.startEndDates != false ? vm.startEndDates = $scope.$parent.startEndDates : backToMain('error: vm.startEndDates == undefined!');

            if (needMain) {
                console.log(string);
                alert('Please, import the *.csv file before');
                location.href = '/main';
            }
            function backToMain(str) {
                string += str + '\n';
                needMain = true;
            }
        }

        //создает объект, который содержит поля "имя_модели: {номер_размера: [массив по датам с кол-вом проданного этого размера в эту дату]}"
        //isDays определяет будут ли данные на выходе понедельно или подневно
        function getDataBySizes(isDays, rslv) {

            var arr = vm.data;
            var dates;
            dates = vm.startEndDates;
            var result = {};
            var resultBar = {};

            result = getStructuredByModelsArray(arr, vm.modelNames);            
            resultBar = getStructuredByModelArray4Bars(vm.modelNames);
            
            //console.log('Bar structured data:');
            //console.log(resultBar);
            fillAnArrayOfData(arr);
            //console.log('Filled bar structured data:');
            //console.log(resultBar);

            isDays ? vm.dateLabelsArray = createDateLabelsArray(dates) : vm.dateLabelsArray = createWeekLabelsArray();
            //console.log(vm.dateLabelsArray);

            //console.log(result);
            vm.dataBySizes = result;
            vm.dataBySizesinBars = resultBar;
            
            
            if (rslv != undefined) {
                rslv();
            }
            //метод создает структуру "имя_модели: {номер_размера: [массив по датам с кол-вом проданного этого размера в эту дату]}"
            function getStructuredByModelsArray(ar, mNames) {
                var res = {};

                for (var i = 0; i < mNames.length; i++) {
                    res[mNames[i]] = getColorsArray(mNames[i]);
                }
                                
                return res;

                function getColorsArray(name) {

                    var res = {};

                    //var size = findMinMaxSize();
                    var colors = findAllColors();
                    addColorsToPalette(colors);

                    /*for (var i = size.min; i <= size.max; i += 2) {

                        if (isDays) {
                            res[i] = getDatesArray(dates, name, i);
                        } else {
                            res[i] = getWeeksArray(dates, name, i);
                        }

                        if (i > 100) {
                            console.log('error: size over than 100!');
                            break;
                        }
                    }*/

                    for (var i = 0; i < colors.length; i++) {

                        if (isDays) {
                            res[colors[i]] = getDatesArray(dates, name, colors[i]);
                        } else {
                            res[colors[i]] = getWeeksArray(dates, name, colors[i]);
                        }

                        if (i > 25) {
                            console.log('error: colors over than 25!');
                            break;
                        }
                    }

                    return res;

                    function findMinMaxSize() {
                        var s = { min: 99, max: 0 };

                        for (var i = 0; i < ar.length; i++) {

                            if (ar[i].Name == name) {

                                if (ar[i].Size < s.min) {
                                    s.min = ar[i].Size;
                                }
                                if (ar[i].Size > s.max) {
                                    s.max = ar[i].Size;
                                }
                            }
                        }
                        s.min = Number(s.min);
                        s.max = Number(s.max);

                        return s;
                    }
                    function findAllColors() {

                        var colorArr = [];

                        for (var i = 0; i < ar.length; i++) {

                            if (ar[i].Name == name) {

                                if (colorArr.length == 0) {
                                    colorArr.push(ar[i].Color);
                                    continue;
                                }

                                addColorToColorsArr(ar[i].Color, colorArr)

                            }
                        }
                        return colorArr;

                        function addColorToColorsArr(color, ar) {

                            for (var j = 0; j < ar.length; j++) {

                                if (ar[j] == color) {
                                    return;
                                } else {
                                    if (j == ar.length - 1) {
                                        ar.push(color);
                                        return;
                                    }                                    
                                }
                            }
                        }
                    }
                    function addColorsToPalette(colArr) {

                        for (var i = 0; i < colArr.length; i++) {

                            if (vm.colorPalettes[colArr[i]] == undefined) {
                                vm.colorPalettes[colArr[i]] = colArr[i];
                                colorsArrayForPalette.push(colArr[i]);
                            } else {
                                continue;
                            }

                        }
                    }
                    //метод создает массив по датам со стартовой по финальную
                    function getDatesArray(d, n, c) {

                        var tempDate = d.start;
                        var res = [];
                        var i = 0;

                        res.push({
                            Date: tempDate,
                            Color: c,
                            Name: n,
                            Quantity: 0
                        });

                        do {
                            tempDate = addDays(tempDate);

                            res.push({
                                Date: tempDate,
                                Color: c,
                                Name: n,
                                Quantity: 0
                            });

                            i++;
                            if (i == 366) {
                                console.log('Time period set bigger then one year!');
                            }

                        } while (!compareDate(tempDate, d.end) && i < 366);

                        return res;
                    }
                    function getWeeksArray(d, n, c) {
                        

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
                                        Color: c,
                                        Name: n,
                                        Quantity: 0
                                    });                                  
                                }

                                weeksArray.push({
                                    Date: new Date(tempWeekDate),
                                    Color: c,
                                    Name: n,
                                    Quantity: 0
                                });                                
                            }

                            if (weekNo > 55) {
                                console.log('error: quantity of weeks is bigger than 55!');
                                break;
                            }
                            
                            weekNo++;
                        }
                                                
                        return weeksArray;
                    }
                }
            }
            function getStructuredByModelArray4Bars(mNames) {
                var res = {};
                for (var i = 0; i < mNames.length; i++) {
                    res[mNames[i]] = [];
                    for (var color in result[mNames[i]]) {
                        res[mNames[i]].push({ Name: mNames[i], Color: color, Quantity: 0 });
                    }
                }
                
                return res;
            }
            function fillAnArrayOfData(ar) {
                
                for (var i = 0; i < ar.length; i++) {

                    AddQuanToDate(ar[i], result[ar[i].Name][ar[i].Color]);                    
                    AddQuanToColor(ar[i], resultBar[ar[i].Name]);

                }
                function AddQuanToDate(item, obj) {
                    
                    if (isDays) {

                        for (var k = 0; k < obj.length; k++) {

                            if (compareDate(obj[k].Date, item.Date)) {

                                obj[k].Quantity += item.Quantity;
                                return;
                            }

                            if (k == obj.length - 1) {
                                console.log('error: AddQuanToDate()! { have no item with this date in array, item: ' + item + ' }');
                            }
                        }

                    } else {
                        //console.log(item);
                        //console.log(obj);
                        for (var k = 0; k < obj.length; k++) {

                            if (obj[k].Date <= item.Date && obj[k+1].Date > item.Date) {
                                obj[k].Quantity += item.Quantity;
                                return;
                            }

                            if (k == obj.length - 1) {
                                console.log(obj[k].Date);
                                console.log(new Date(item.Date));
                                console.log('error: AddQuanToDate()!');
                            }
                        }
                    }                    
                }
                function AddQuanToColor(item, obj) {
                    for (var i = 0; i < obj.length; i++) {
                        if (item.Color == obj[i].Color) {
                            obj[i].Quantity += item.Quantity;
                            return;
                        }
                        if (i == obj.length - 1) {
                            console.log('error: AddQuanToColor()!');
                        }
                    }
                }
            }
            
            function addDays(date) {
                var result = new Date(date);
                result.setDate(result.getDate() + 1);
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
                console.log('error in compareDate()');
            }
            
            function createDateLabelsArray(d) {
                var tempDate = d.start;
                var index = 0;
                var arr = [];
                arr.push(tempDate);

                do {
                    tempDate = addDays(tempDate);
                    arr.push(tempDate);

                    if (index > 366) {
                        console.log('error: index is over than 366 in createLabelsArray()!');
                        return;
                    }

                    index++;
                } while (!compareDate(tempDate, d.end));

                arr = makeShortDate(arr);

                return arr;               
            }
            function createWeekLabelsArray() {
                
                var ar = result;
                var temp = [];
                var res = [];
                
                for (var color in ar[vm.modelNames[0]]) {
                    temp = ar[vm.modelNames[0]][color];
                    break;
                }
                
                for (var i = 0; i < temp.length; i++) {
                    res.push(temp[i].Date);
                }

                res = makeShortDate(res);

                return res;
            }
            function makeShortDate(a) {
                var tempArr = [];
                var temp = [];

                for (var i = 0; i < a.length; i++) {
                    temp = [
                        a[i].getFullYear(),
                        a[i].getMonth() + 1,
                        a[i].getDate()]
                        .join('-');

                    tempArr.push(temp);
                }

                return tempArr;
            }
        }
        
        function initAllCanvas() {
            for (var i = 0; i < vm.modelNames.length; i++) {

                initCanva(i);
            }
                                    
        }
        function initCanva(index) {
            //lines:
            document.getElementById(index + 'CH').innerHTML = '<canvas id="' + index + 'Chart"></canvas>';
            vm.CtxArr[vm.modelNames[index]] = document.getElementById(index + 'Chart').getContext("2d");
            //vm.CtxArr[vm.modelNames[index]].canvas.width = document.getElementById(index + 'CH').clientWidth;
            vm.CtxArr[vm.modelNames[index]].canvas.width = 1029;
            //magic number: 287!
            vm.CtxArr[vm.modelNames[index]].canvas.height = 287;

            //bars:
            document.getElementById(index + 'CH4Bar').innerHTML = '<canvas id="' + index + 'BarChart"></canvas>';
            vm.CtxArrBar[vm.modelNames[index]] = document.getElementById(index + 'BarChart').getContext("2d");
            //vm.CtxArrBar[vm.modelNames[index]].canvas.width = document.getElementById(index + 'CH4Bar').clientWidth;
            vm.CtxArrBar[vm.modelNames[index]].canvas.width = 1029;
            //magic number: 287!
            vm.CtxArrBar[vm.modelNames[index]].canvas.height = 287;
        }
        function clearAllCanvas() {
            for (var i = 0; i < vm.modelNames.length; i++) {
                document.getElementById(i + "Chart").remove();
                document.getElementById(i + "BarChart").remove();
            }
            initAllCanvas();
        }
        function clearCanvas(i) {
            document.getElementById(i + "Chart").remove();
            document.getElementById(i + "BarChart").remove();

            initCanva(i);
        }
        function fillAllCharts() {
                         
            clearAllCanvas();
            fillAllLineCharts();
            fillAllBarCharts();

            function fillAllLineCharts() {
                vm.colorPalettes[colorsArrayForPalette[0]] = "rgba(234, 224, 200"; //жемчуг
                vm.colorPalettes[colorsArrayForPalette[1]] = "rgba(230, 230, 250"; //лаванда
                vm.colorPalettes[colorsArrayForPalette[2]] = "rgba(246, 184, 189"; //пудра
                vm.colorPalettes[colorsArrayForPalette[3]] = "rgba(0, 2, 46";      //синий
                vm.colorPalettes[colorsArrayForPalette[4]] = "rgba(157, 118, 81";  //капучино
                vm.colorPalettes[colorsArrayForPalette[5]] = "rgba(170, 240, 209"; //мята
                vm.colorPalettes[colorsArrayForPalette[6]] = "rgba(250, 223, 173"; //персик
                vm.colorPalettes[colorsArrayForPalette[7]] = "rgba(117, 19, 27";   //вишня
                vm.colorPalettes[colorsArrayForPalette[8]] = "rgba(201, 94, 251";  //сирень
                vm.colorPalettes[colorsArrayForPalette[9]] = "rgba(227, 11, 93";   //малина                
                vm.colorPalettes[colorsArrayForPalette[10]] = "rgba(255, 64, 64";  //корал
                vm.colorPalettes[colorsArrayForPalette[11]] = "rgba(227, 255, 0";  //лимон
                vm.colorPalettes[colorsArrayForPalette[12]] = "rgba(0, 0, 0";      //черный
                var tempData = {};                
                tempData.labels = vm.dateLabelsArray;

                for (var m = 0; m < vm.modelNames.length; m++) {

                    tempData = new Object();
                    tempData.labels = vm.dateLabelsArray;

                    var l = 0;
                    tempData.datasets = [];

                    for (var size in vm.dataBySizes[vm.modelNames[m]]) {
                        
                        tempData.datasets.push({
                            label: size,
                            data: getDatasetsData(vm.dataBySizes[vm.modelNames[m]][size]),
                            fillColor: vm.colorPalettes[size] + ",0)",
                            strokeColor: vm.colorPalettes[size] + ",1)",
                            pointColor: vm.colorPalettes[size] + ",1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: vm.colorPalettes[size] + ",1)"
                        });
                        l++;
                    }
                    //console.log(tempData);

                    vm.chartData.line[vm.modelNames[m]] = tempData;

                    if (vm.navArr[m] == true) {
                        vm.ChrtArr[vm.modelNames[m]] = new Chart(
                            vm.CtxArr[vm.modelNames[m]],
                            {
                                type: 'line',
                                data: tempData,
                                options: {
                                    legend: {
                                        display: true,
                                        labels: {
                                            fontColor: 'rgb(55,172,172)'
                                        }
                                    }
                                }
                            }).Line(tempData);
                    }
                    
                }

                function getDatasetsData(arr) {

                    var r = [];

                    for (var i = 0; i < arr.length; i++) {
                        r.push(arr[i].Quantity);
                    }

                    return r;
                }
            }
            function fillAllBarCharts() {
                vm.colorPalettes[colorsArrayForPalette[0]] = "rgba(234, 224, 200"; //жемчуг
                vm.colorPalettes[colorsArrayForPalette[1]] = "rgba(230, 230, 250"; //лаванда
                vm.colorPalettes[colorsArrayForPalette[2]] = "rgba(246, 184, 189"; //пудра
                vm.colorPalettes[colorsArrayForPalette[3]] = "rgba(0, 2, 46";      //синий
                vm.colorPalettes[colorsArrayForPalette[4]] = "rgba(157, 118, 81";  //капучино
                vm.colorPalettes[colorsArrayForPalette[5]] = "rgba(170, 240, 209"; //мята
                vm.colorPalettes[colorsArrayForPalette[6]] = "rgba(250, 223, 173"; //персик
                vm.colorPalettes[colorsArrayForPalette[7]] = "rgba(117, 19, 27";   //вишня
                vm.colorPalettes[colorsArrayForPalette[8]] = "rgba(201, 94, 251";  //сирень
                vm.colorPalettes[colorsArrayForPalette[9]] = "rgba(227, 11, 93";   //малина
                vm.colorPalettes[colorsArrayForPalette[10]] = "rgba(255, 64, 64";  //корал
                vm.colorPalettes[colorsArrayForPalette[11]] = "rgba(227, 255, 0";  //лимон
                vm.colorPalettes[colorsArrayForPalette[12]] = "rgba(0, 0, 0";      //черный

                //console.log('vm.dataBySizesInbars:');
                //console.log(vm.dataBySizesinBars);
                var tempData = { labels: [], datasets: {} };

                for (var i = 0; i < vm.modelNames.length; i++) {
                    tempData = { labels: [], datasets: {} };

                    tempData = getDataSetsAndLabels(vm.modelNames[i], i);
                    //console.log('Bar chart temp data: ' + i);
                    //console.log(tempData);
                    vm.chartData.bar[vm.modelNames[i]] = tempData;

                    if (vm.navArr[i] == true) {
                        vm.ChrtArrBar[vm.modelNames[i]] = new Chart(vm.CtxArrBar[vm.modelNames[i]]).Bar(tempData);
                    }
                }
                
                function getDataSetsAndLabels(mName, l) {

                    var td = {
                        labels: [],
                        datasets: getDataSets(mName, vm.dataBySizesinBars)
                    };

                    var arr = vm.dataBySizesinBars;
                    
                    return td;

                    /*
                    dataSet = [{
                            data: [],
                            fillColor: vm.colorPalettes[colorsArrayForPalette[l]] + ",0.01)",
                            strokeColor: vm.colorPalettes[colorsArrayForPalette[l]] + ",1)",
                            pointColor: vm.colorPalettes[colorsArrayForPalette[l]] + ",1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: vm.colorPalettes[colorsArrayForPalette[l]] + ",1)"
                        }]
                    */

                    function getDataSets(mN, arr) {
                        var dataSet = [];

                        for (var x = 0; x < arr[mN].length; x++) {
                            dataSet.push({ data: [arr[mN][x].Quantity] });

                            //dataSet[x].data.push(arr[mN][x].Quantity);
                            dataSet[x].label = arr[mN][x].Color;
                            dataSet[x].fillColor = vm.colorPalettes[arr[mN][x].Color] + ",0.81)";
                            dataSet[x].strokeColor = vm.colorPalettes[arr[mN][x].Color] + ",1)";
                            dataSet[x].pointColor = vm.colorPalettes[arr[mN][x].Color] + ",1)";
                            dataSet[x].pointStrokeColor = "#fff";
                            dataSet[x].pointHighlightFill = "#fff";
                            dataSet[x].pointHighlightStroke = vm.colorPalettes[arr[mN][x].Color] + ",1)";
                        }

                        return dataSet;
                    }
                }
                
            }
        }

        function makeCharts() {

            var promiseGetData = new Promise((resolve, reject) => {
                getDataBySizes(false, resolve);
            });

            promiseGetData.then(() => {
                initAllCanvas();
                fillAllCharts();                
            });
        }

        function showOrHideThisChart(index) {
            if (vm.isMultipleView) {

                vm.navArr[index] = !vm.navArr[index];

                if (vm.navArr[index] == true) {
                    initCanva(index);
                    clearCanvas(index);

                    setTimeout(drawThisChart, 5, index);
                }

            } else {

                for (var i = 0; i < vm.navArr.length; i++) {
                    vm.navArr[i] = false;
                }
                
                setTimeout(drawThisChart, 150, index);
            }
                        
            function drawThisChart(index) {
                $scope.$apply(function () {
                    vm.navArr[index] = true;
                });                
                var i = index;              
                //initCanva(index);
                //clearCanvas(index);
                if (vm.chartData.line.hasOwnProperty(vm.modelNames[i])) {
                    vm.ChrtArr[vm.modelNames[i]] = new Chart(
                            vm.CtxArr[vm.modelNames[i]],
                            {
                                type: 'line',
                                data: vm.chartData.line[vm.modelNames[i]],
                                options: {
                                    legend: {
                                        display: true,
                                        labels: {
                                            fontColor: 'rgb(55,172,172)'
                                        }
                                    }
                                }
                            }).Line(vm.chartData.line[vm.modelNames[i]]);
                } else {
                    console.log('vm.chartData.line has no property ' + vm.modelNames[i]);
                }
                

                if (vm.chartData.bar.hasOwnProperty(vm.modelNames[i])) {
                    vm.ChrtArrBar[vm.modelNames[i]] = new Chart(vm.CtxArrBar[vm.modelNames[i]]).Bar(vm.chartData.bar[vm.modelNames[i]]);
                } else {
                    console.log('vm.chartData.bar has no property ' + vm.modelNames[i]);
                }
            }
        }
        function getInfoInConsole() {


            console.log(document.getElementById('0CH4Bar'));
        }
        function showAdditionalNavBtns() {
            if (vm.showNavStatus == 'Show') {
                vm.showNavStatus = 'Hide';
                vm.showNav = true;
            } else {
                vm.showNav = false;
                vm.showNavStatus = 'Show';
            }
        }
        function setMultipleView() {
            if (!vm.isMultipleView) {
                vm.isMultipleView = true;
                vm.multipleStatus = 'Off';
            } else {
                vm.isMultipleView = false;
                vm.multipleStatus = 'On';
            }
        }
    }
})();