(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('SizesController', SizesController);

    SizesController.$inject = ['$scope'];
    function SizesController($scope) {

        //view model
        var vm = this;
        console.log('initialized sizes ctrl');

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

        var colors = false;

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
            colors = $scope.$parent.colorsCollection;

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
            console.log(resultBar);
            //console.log('Bar structured data:');
            //console.log(resultBar);
            fillAnArrayOfData(arr);
            //console.log('Filled bar structured data:');
            //console.log(resultBar);

            isDays ? vm.dateLabelsArray = createDateLabelsArray(dates) : vm.dateLabelsArray = createWeekLabelsArray(result);
            console.log(vm.dateLabelsArray);

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
                    res[mNames[i]] = getSizesArray(mNames[i]);
                }
                                
                return res;

                
                function getSizesArray(name) {

                    var res = {};

                    var size = findMinMaxSize();

                    for (var i = size.min; i <= size.max; i += 2) {

                        if (isDays) {
                            res[i] = getDatesArray(dates, name, i);
                        } else {
                            res[i] = getWeeksArray(dates, name, i);
                        }

                        if (i > 100) {
                            console.log('error: size over than 100!');
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
                    //метод создает массив по датам со стартовой по финальную
                    function getDatesArray(d, n, s) {

                        var tempDate = d.start;
                        var res = [];
                        var i = 0;

                        res.push({
                            Date: tempDate,
                            Size: s,
                            Name: n,
                            Quantity: 0
                        });

                        do {
                            tempDate = addDays(tempDate);

                            res.push({
                                Date: tempDate,
                                Size: s,
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
                    function getWeeksArray(d, n, s) {
                        

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
                                        Size: s,
                                        Name: n,
                                        Quantity: 0
                                    });                                  
                                }

                                weeksArray.push({
                                    Date: new Date(tempWeekDate),
                                    Size: s,
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
                }
            }
            function getStructuredByModelArray4Bars(mNames) {
                var res = {};
                for (var i = 0; i < mNames.length; i++) {
                    res[mNames[i]] = [];
                    for (var size in result[mNames[i]]) {
                        res[mNames[i]].push({ Name: mNames[i], Size: size, Quantity: 0 });
                    }
                }
                
                return res;
            }
            function fillAnArrayOfData(ar) {
                
                for (var i = 0; i < ar.length; i++) {

                    AddQuanToDate(ar[i], result[ar[i].Name][ar[i].Size]);                    
                    AddQuanToSize(ar[i], resultBar[ar[i].Name]);

                }                

                function AddQuanToDate(item, obj) {
                    //console.log(obj);

                    if (isDays) {

                        for (var k = 0; k < obj.length; k++) {

                            if (compareDate(obj[k].Date, item.Date)) {

                                obj[k].Quantity += item.Quantity;
                                return;
                            }

                            if (k == obj.length - 1) {
                                console.log('error: AddQuanToDate()!');
                            }
                        }

                    } else {

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
                function AddQuanToSize(item, obj) {
                    for (var i = 0; i < obj.length; i++) {
                        if (item.Size == obj[i].Size) {
                            obj[i].Quantity += item.Quantity;
                            return;
                        }
                        if (i == obj.length - 1) {
                            console.log('error: AddQuanToSize()!');
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
            function createWeekLabelsArray(ar) {
                
                var temp = [];
                var res = [];
                for (var size in ar[vm.modelNames[0]]) {
                    temp = ar[vm.modelNames[0]][size];
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
                            fillColor: colors[l] + ",0.01)",
                            strokeColor: colors[l] + ",1)",
                            pointColor: colors[l] + ",1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: colors[l] + ",1)"
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
                        datasets: [{
                            data: [],
                            fillColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",0.01)",
                            strokeColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                            pointColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)"
                        }]
                    };
                    var arr = vm.dataBySizesinBars;

                    for (var x = 0; x < arr[mName].length; x++) {
                        td.labels.push(arr[mName][x].Size);
                        td.datasets[0].data.push(arr[mName][x].Quantity);
                    }

                    return td;
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