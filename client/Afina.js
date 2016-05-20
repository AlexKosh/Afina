
    angular.module('Afina', ['angular-meteor', 'ui.router']);
    
    //Afina RouteConfig
angular.module('Afina').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
 
    $stateProvider
      .state('main', {
        url: '/main',
        template: '<main-page></main-page>'
      })
      .state('model', {
          url: '/model',
          template: '<model-page></model-page>'
      });
 
    $urlRouterProvider.otherwise("/");
  });
  
  angular.module('Afina').directive('mainPage', function(){
      return {
          restrict: 'EA',
          templateUrl: 'client/partials/main.html'
      }
  });
  
    angular.module('Afina').directive('modelPage', function(){
      return {
          restrict: 'EA',
          templateUrl: 'client/partials/model.html'
      }
  });
    
    //Afina MainController
    angular.module('Afina')
    .controller('MainController', MainController);

    MainController.$inject = ['$scope'];
    function MainController($scope) {
        //view model
        var vm = this;
        console.log('initialized main ctrl');

        
        //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
        vm.exportData = false;
        $scope.data = false;

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
                        var targetColumns = ['Variant SKU', 'Item Product', 'Item Name', 'Item Quantity', 'Issue Date'];
                        //массив названий колонок из csv файла
                        var header = vm.roughData[0];

                        var indexes = getHeaderIndexes(targetColumns);
                        var data = getJsonObjects(vm.roughData);
                        vm.exportData = data;
                        $scope.data = data;

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

                                newObject.Name = tempObject['Item Product'];
                                newObject.SKU = tempObject['Variant SKU'];
                                newObject.Quantity = parseInt(tempObject['Item Quantity']);
                                newObject.Date = tempObject['Issue Date'];

                                function getColorAndSize() {
                                    var colorDashSize = tempObject['Item Name'];
                                    var dashIndex = 0;

                                    for (var i = 0; i < colorDashSize.length; i++) {
                                        if (colorDashSize[i] == '/') {
                                            dashIndex = i;
                                            break;
                                        }
                                    }

                                    newObject.Size = colorDashSize.slice(0, 2);
                                    newObject.Color = colorDashSize.slice(3);
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

    }
    
    //Afina ModelController
    angular.module('Afina')
        .controller('ModelController', ModelController);

    ModelController.$inject = ['$scope'];
    function ModelController($scope) {
        var vm = this;
        console.log('initialized model ctrl');
        
        //после удачного парсинга файла и последующей удачной обработки, данные помещаются сюда, а пока это false
        vm.exportData = false;

        var leftCtx = {};
        var leftChart = {};
        var rightCtx = {};
        var rightChart = {};

        console.log($scope.$parent);
        //
        vm.chooseChangedData = chooseChangedData;
        vm.chooseExportData = chooseExportData;
        vm.clearCanva = clearCanva;
        vm.chooseDefaultData = chooseDefaultData;

        init();

        function clearCanva() {
            document.getElementById("leftChart").remove();
            document.getElementById("rightChart").remove();

            initCanva();
        };
        //проверяет был ли загружен и успешно спарсин csv файл, если да, загружент json данные из файла в vm.exportData
        function checkExportData() {
            $scope.$parent.data != false ? vm.exportData = $scope.$parent.data : null;
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
        function chooseExportData() {
            var labels = [];
            var datasetsData = [];
            for (var i = 0; i < vm.exportData.length; i++) {
                labels.push(vm.exportData[i].Date);
                datasetsData.push(vm.exportData[i].Quantity);
            }
            //console.log(datasetsData);

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
            }

            clearCanva();
            leftChart = new Chart(leftCtx).Line(vm.data);
            rightChart = new Chart(rightCtx).Line(vm.data);
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
            checkExportData();
        };
        //функция создают canvas для двух графиков на странице: левого и правого и задает им ширину/высоту как у родительского эл-та
        function initCanva() {
            document.getElementById("leftCanvasHolder").innerHTML = '<canvas id="leftChart"></canvas>';
            document.getElementById("rightCanvasHolder").innerHTML = '<canvas id="rightChart"></canvas>';
            leftCtx = document.getElementById("leftChart").getContext("2d");
            leftCtx.canvas.width = document.getElementById("leftCanvasHolder").clientWidth;
            leftCtx.canvas.height = document.getElementById("leftCanvasHolder").clientHeight;
            rightCtx = document.getElementById("rightChart").getContext("2d");
            rightCtx.canvas.width = document.getElementById("rightCanvasHolder").clientWidth;
            rightCtx.canvas.height = document.getElementById("rightCanvasHolder").clientHeight;
        };
    }


