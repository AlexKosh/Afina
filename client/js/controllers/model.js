(function () {

    //Afina ModelController
angular.module('Afina').controller('ModelController', ModelController);

ModelController.$inject = ['$scope'];
function ModelController($scope) {
        var vm = this;
        console.log('initialized model ctrl');
        
        //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
        vm.dataByDate = false;
            
        var genQuanCtx = {};
        var genQuanChart = {};
        var genQuanByModelsCtx = {};
        var genQuanByModelsChart = {};

        var colors = false;
        
        init();

        function clearAllCanva() {
            document.getElementById("genQuanChart").remove();
            document.getElementById("genQuanByModelsChart").remove();

            initCanva();
        };
        //проверяет был ли загружен и успешно спарсин csv файл, если да, загружент json данные из файла в vm.dataByDate        
        function checkData() {
            var string = '';
            var needMain = false;
                        
            $scope.$parent.dataByDate != false ? vm.dataByDate = $scope.$parent.dataByDate : backToMain('error: vm.dataByDate == undefined!');
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
        
        function chooseDataByDate() {
            var labels = [];
            var datasetsData = [];
            for (var i = 0; i < vm.dataByDate[0].length; i++) {
                labels.push(vm.dataByDate[0][i].Date);
                datasetsData.push(vm.dataByDate[0][i].Quantity);
            }            
            
            var thisColor = colors[getRandomInt(0, 17)];
            
            //заполняет dataset для графика общих продаж
            vm.data = {
                labels: labels,
                datasets: [
                    {                        
                        fillColor: thisColor + ",0.35)",
                        strokeColor: thisColor + ",1)",
                        pointColor: thisColor + ",1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: thisColor + ",1)",
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
                    fillColor: colors[l] + ",0)",
                    strokeColor: colors[l] + ",1)",
                    pointColor: colors[l] + ",1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: colors[l] + ",1)",
                    data: datasetsData[l]
                });
            }


            clearAllCanva();
            genQuanChart = new Chart(genQuanCtx).Line(vm.data);
            genQuanByModelsChart = new Chart(genQuanByModelsCtx).Line(vm.dataByModels);

            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            }
        };
        
        //эта функция срабатывает первой при запуске страницы
        function init() {
            checkData();
            initCanva();            
            chooseDataByDate();
        };
        //функция создают canvas для двух графиков на странице: левого и правого и задает им ширину/высоту как у родительского эл-та
        function initCanva() {            
            document.getElementById("genQuanCH").innerHTML = '<canvas id="genQuanChart"></canvas>';
            document.getElementById("genQuanByModelsCH").innerHTML = '<canvas id="genQuanByModelsChart"></canvas>';            
            genQuanCtx = document.getElementById("genQuanChart").getContext("2d");
            genQuanCtx.canvas.width = document.getElementById("genQuanCH").clientWidth;
            //magic number: 387
            genQuanCtx.canvas.height = 287;
            genQuanByModelsCtx = document.getElementById("genQuanByModelsChart").getContext("2d");
            genQuanByModelsCtx.canvas.width = document.getElementById("genQuanByModelsCH").clientWidth;
            //magic number: 387
            genQuanByModelsCtx.canvas.height = 287;

        };
    }
})();