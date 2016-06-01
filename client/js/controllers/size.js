(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('SizesController', SizesController);

    SizesController.$inject = ['$scope'];
    function SizesController($scope) {

        //view model
        var vm = this;
        console.log('initialized sizes ctrl');

        vm.data = [];
        vm.modelNames = [];
        vm.startEndDates = {};
        vm.dataBySizes = [];
        vm.dataBySizesInWeeks = [];

        vm.navArr = [];
        vm.CtxArr = {};
        vm.ChrtArr = {};
        vm.dateLabelsArray = [];        

        vm.getDataBySizes = getDataBySizes;
        vm.initAllCanvas = initAllCanvas;
        vm.clearAllCanvas = clearAllCanvas;
        vm.fillAllCharts = fillAllCharts;

        init();
        
        function init() {
            checkData();            
            vm.navArr[0] = true;
            //makeAllCharts();
        }
        function checkData() {
            $scope.$parent.data != false ? vm.data = $scope.$parent.data : console.log('error: vm.data == undefined!');
            $scope.$parent.modelName != false ? vm.modelNames = $scope.$parent.modelNames : console.log('error: vm.modelNames == undefined!');
            $scope.$parent.startEndDates != false ? vm.startEndDates = $scope.$parent.startEndDates : console.log('error: vm.startEndDates == undefined!');
        }

        //создает объект, который содержит поля "имя_модели: {номер_размера: [массив по датам с кол-вом проданного этого размера в эту дату]}"
        //isDays определяет будут ли данные на выходе понедельно или подневно
        function getDataBySizes(isDays) {

            var arr = vm.data;
            var dates;
            dates = vm.startEndDates;
            var result = {};

            result = getStructuredByModelsArray(arr, vm.modelNames);
            console.log(result);
            fillAnArrayOfData(arr);

            isDays ? vm.dateLabelsArray = createDateLabelsArray(dates) : vm.dateLabelsArray = createWeekLabelsArray(result);
            console.log(vm.dateLabelsArray);

            //console.log(result);
            vm.dataBySizes = result;
            //return result;
                        
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
            function fillAnArrayOfData(ar) {
                
                for (var i = 0; i < ar.length; i++) {

                    AddQuanToDate(ar[i], result[ar[i].Name][ar[i].Size]);
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

            function initCanva(index) {
                document.getElementById(index + 'CH').innerHTML = '<canvas id="' + index + 'Chart"></canvas>';
                vm.CtxArr[vm.modelNames[index]] = document.getElementById(index + 'Chart').getContext("2d");
                vm.CtxArr[vm.modelNames[index]].canvas.width = document.getElementById(index + 'CH').clientWidth;
                //magic number: 287!
                vm.CtxArr[vm.modelNames[index]].canvas.height = 287;
            }
        }
        function clearAllCanvas() {
            for (var i = 0; i < vm.modelNames.length; i++) {
                document.getElementById(i + "Chart").remove();
            }
            initAllCanvas();
        }
        function fillAllCharts() {
            var tempData = {};
            clearAllCanvas();
            tempData.labels = vm.dateLabelsArray;

            console.log(1);

            for (var m = 0; m < vm.modelNames.length; m++) {
                
                var l = 0;
                tempData.datasets = [];

                for (var size in vm.dataBySizes[vm.modelNames[m]]) {

                    tempData.datasets.push({
                        label: size,
                        data: getDatasetsData(vm.dataBySizes[vm.modelNames[m]][size]),                        
                        fillColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",0.01)",
                        strokeColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)"                        
                    });
                    l++;                    
                }
                console.log(tempData);
                vm.ChrtArr[vm.modelNames[m]] = new Chart(vm.CtxArr[vm.modelNames[m]],
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
                    }
                    ).Line(tempData);
            }

            function getDatasetsData(arr) {

                var r = [];

                for (var i = 0; i < arr.length; i++) {
                    r.push(arr[i].Quantity);
                }

                return r;
            }                        
        }
    }
})();