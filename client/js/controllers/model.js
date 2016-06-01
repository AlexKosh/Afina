(function () {

    //Afina ModelController
angular.module('Afina').controller('ModelController', ModelController);

ModelController.$inject = ['$scope'];
function ModelController($scope) {
        var vm = this;
        console.log('initialized model ctrl');
        
        //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
        vm.exportData = false;
        vm.dataByDate = false;

        var leftCtx = {};
        var leftChart = {};
        var rightCtx = {};
        var rightChart = {};
        var genQuanCtx = {};
        var genQuanChart = {};
        var genQuanByModelsCtx = {};
        var genQuanByModelsChart = {};

        
        vm.chooseChangedData = chooseChangedData;
        vm.chooseDataByDate = chooseDataByDate;
        vm.clearCanva = clearCanva;
        vm.chooseDefaultData = chooseDefaultData;

        init();

        function clearCanva() {
            document.getElementById("leftChart").remove();
            document.getElementById("rightChart").remove();
            document.getElementById("genQuanChart").remove();
            document.getElementById("genQuanByModelsChart").remove();

            initCanva();
        };
        //проверяет был ли загружен и успешно спарсин csv файл, если да, загружент json данные из файла в vm.exportData
        function checkDataByDate() {
            $scope.$parent.dataByDate != false ? vm.dataByDate = $scope.$parent.dataByDate : null;
        };
        function chooseChangedData() {
            vm.data = {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,120,120,0.2)",
                        strokeColor: "rgba(220,120,120,1)",
                        pointColor: "rgba(220,120,120,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,120,120,1)",
                        data: [45, 29, 70, 41, 86, 55, 60]
                    },
                    {
                        label: "My Second dataset",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        data: [28, 48, 40, 19, 86, 27, 90]
                    }
                ]
            };

            clearCanva();
            leftChart = new Chart(leftCtx).Line(vm.data);
            rightChart = new Chart(rightCtx).Line(vm.data);
        };
        function chooseDataByDate() {
            var labels = [];
            var datasetsData = [];
            for (var i = 0; i < vm.dataByDate[0].length; i++) {
                labels.push(vm.dataByDate[0][i].Date);
                datasetsData.push(vm.dataByDate[0][i].Quantity);
            }

            //заполняет dataset для графика общих продаж
            vm.data = {
                labels: labels,
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,120,120,0.2)",
                        strokeColor: "rgba(220,120,120,1)",
                        pointColor: "rgba(220,120,120,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,120,120,1)",
                        data: datasetsData
                    }]
            };

            //заполняет datasets для графиков моделей
            datasetsData = [[]];
            for (var m = 1; m < vm.dataByDate.length; m++) {
                for (var i = 0; i < vm.dataByDate[m].length; i++) {
                    datasetsData[m - 1].push(vm.dataByDate[m][i].Quantity);
                }
                if (m != vm.dataByDate.length - 1) {
                    datasetsData.push([]);
                }
            }
                        
            vm.dataByModels = { labels: labels, datasets: [] };
            for (var l = 0; l < vm.dataByDate.length - 1; l++) {
                vm.dataByModels.datasets.push({
                    label: vm.dataByDate[l+1][0].Name,
                    fillColor: "rgba(" + (20 + 30 * l) + ","+ (180 - 20 * l) +"," + (120 + 2 * l) + ",0.2)",
                    strokeColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                    pointColor: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(" + (20 + 30 * l) + "," + (180 - 20 * l) + "," + (120 + 2 * l) + ",1)",
                    data: datasetsData[l]
                });
            }


            clearCanva();
            leftChart = new Chart(leftCtx).Line(vm.data);
            rightChart = new Chart(rightCtx).Line(vm.data);
            genQuanChart = new Chart(genQuanCtx).Line(vm.data);
            genQuanByModelsChart = new Chart(genQuanByModelsCtx).Line(vm.dataByModels);
        };
        function chooseDefaultData() {
            vm.data = {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: [65, 59, 80, 81, 56, 55, 40]
                    },
                    {
                        label: "My Second dataset",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        data: [28, 48, 40, 19, 86, 27, 90]
                    }
                ]
            };
            clearCanva();
            leftChart = new Chart(leftCtx).Line(vm.data);
            rightChart = new Chart(rightCtx).Line(vm.data);
        };
        //эта функция срабатывает первой при запуске страницы
        function init() {
            initCanva();
            checkDataByDate();
            if (vm.dataByDate != false) {
                chooseDataByDate();
            }
        };
        //функция создают canvas для двух графиков на странице: левого и правого и задает им ширину/высоту как у родительского эл-та
        function initCanva() {
            document.getElementById("leftCanvasHolder").innerHTML = '<canvas id="leftChart"></canvas>';
            document.getElementById("rightCanvasHolder").innerHTML = '<canvas id="rightChart"></canvas>';
            document.getElementById("genQuanCH").innerHTML = '<canvas id="genQuanChart"></canvas>';
            document.getElementById("genQuanByModelsCH").innerHTML = '<canvas id="genQuanByModelsChart"></canvas>';
            leftCtx = document.getElementById("leftChart").getContext("2d");
            leftCtx.canvas.width = document.getElementById("leftCanvasHolder").clientWidth;
            leftCtx.canvas.height = document.getElementById("leftCanvasHolder").clientHeight;
            rightCtx = document.getElementById("rightChart").getContext("2d");
            rightCtx.canvas.width = document.getElementById("rightCanvasHolder").clientWidth;
            rightCtx.canvas.height = document.getElementById("rightCanvasHolder").clientHeight;
            genQuanCtx = document.getElementById("genQuanChart").getContext("2d");
            genQuanCtx.canvas.width = document.getElementById("genQuanCH").clientWidth;
            //magic number: 287
            genQuanCtx.canvas.height = 287;
            genQuanByModelsCtx = document.getElementById("genQuanByModelsChart").getContext("2d");
            genQuanByModelsCtx.canvas.width = document.getElementById("genQuanByModelsCH").clientWidth;
            //magic number: 287
            genQuanByModelsCtx.canvas.height = 287;

        };
    }
})();