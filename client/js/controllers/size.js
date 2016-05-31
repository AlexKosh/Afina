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

        vm.navArr = [];
        vm.CtxArr = {};
        vm.ChrtArr = {};
        vm.labelsArray = [];

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
        function getDataBySizes() {

            var arr = vm.data;
            var dates;
            dates = vm.startEndDates;
            var result = {};

            result = getStructuredByModelsArray(arr, vm.modelNames);
            fillAnArrayOfData(arr);

            vm.labelsArray = createLabelsArray(dates);

            console.log(result);
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

                        res[i] = getDatesArray(dates, name, i);

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
                }
            }
            function fillAnArrayOfData(ar) {
                
                for (var i = 0; i < ar.length; i++) {

                    AddQuanToDate(ar[i], result[ar[i].Name][ar[i].Size]);
                }

                function AddQuanToDate(item, obj) {

                    for (var k = 0; k < obj.length; k++) {

                        if (compareDate(obj[k].Date, item.Date)) {

                            obj[k].Quantity += item.Quantity;
                            return;
                        }

                        if (k == obj.length - 1) {
                            console.log('error: AddQuanToDate()!');
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
            
            function createLabelsArray(d) {
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
            tempData.labels = vm.labelsArray;

            console.log(1);

            for (var m = 0; m < vm.modelNames.length; m++) {
                
                //console.log('------------------------');
                //console.log(vm.dataBySizes);
                //console.log(vm.modelNames[m]);
                //console.log(vm.dataBySizes[vm.modelNames[m]]);
                //console.log('------------------------');
                
                /*for (var l = 0; l < vm.dataBySizes[vm.modelNames[m]].length; l++) {
                    tempData.datasets = [];
                    console.log(3);
                    tempData.datasets.push( {
                        label: vm.modelNames[m] + ' size:' + vm.dataBySizes[vm.modelNames[m]][s][0].Size,
                        fillColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",0.2)",
                        strokeColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        data: getDatasetsData(vm.dataBySizes[vm.modelNames[m]][l])
                    });
                    console.log(tempData);
                }*/

                var l = 0;
                tempData.datasets = [];

                for (var size in vm.dataBySizes[vm.modelNames[m]]) {

                    tempData.datasets.push({
                        label: vm.modelNames[m] + ' size:' + size,
                        fillColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",0.2)",
                        strokeColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                        data: getDatasetsData(vm.dataBySizes[vm.modelNames[m]][size])
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
                                    fontColor: 'rgb(255, 99, 132)'
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