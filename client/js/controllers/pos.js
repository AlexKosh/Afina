(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('PosController', PosController);

    PosController.$inject = ['$scope'];
    function PosController($scope) {

        var vm = this;
        console.log('initialized pos ctrl');
        
        vm.StructuredCollectionsData = [];
        vm.StructuredData = [];

        init();
        
        function init() {            
            //checkData();
        }
        function checkData() {
            var string = '';
            var needMain = false;
            
            $scope.$parent.structuredDataSoH != false ? vm.structuredDataSoH = $scope.$parent.structuredDataSoH : backToMain('error: vm.structuredDataSoH == undefined!');
            $scope.$parent.haveSalesData != false ? vm.haveSalesData = true : backToMain('error: vm.haveSalesData == undefined!');

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
        
        Models = new Mongo.Collection("431");

        //temp data for tests
        var roughDara = tempArrCreate();
        vm.StructuredData = getStructuredData(roughDara);

        $scope.doWork = function () {
            vm.StructuredCollectionsData = fillMongo();
        };

        function fillMongo() {

            var arr = [];
            var models = ["431", "435"];
            var colors = ["Blue", "Gray", "Red"];
            console.log("start");
            for (var m = 0; m < models.length; m++) {
                console.log(1);
                for (var c = 0; c < colors.length; c++) {
                    console.log(2);
                    for (var i = 44; i <= 60; i += 2) {
                        console.log(3);
                        Models.insert({
                            SKU: models[m] + '-' + colors[c].slice(0, 1) + '-' + i,
                            Product: models[m],
                            Color: colors[c],
                            Size: i,
                            InStock: 8
                        });
                        //arr.push({
                        //    SKU: models[m] + '-' + colors[c].slice(0, 1) + '-' + i,
                        //    Product: models[m],
                        //    Color: colors[c],
                        //    Size: i,
                        //    InStock: 8
                        //});
                    }
                }
            }
            console.log("mongo have been filled");
            console.log(arr);
            return arr;
        }

        
        function tempArrCreate() {
            var arr = [];
            var models = ["431", "435"];
            var colors = ["Blue", "Gray", "Red"];

            for (var m = 0; m < models.length; m++) {

                for (var c = 0; c < colors.length; c++) {

                    for (var i = 44; i <= 60; i += 2) {                        

                        arr.push({
                            SKU: models[m] + '-' + colors[c].slice(0, 1) + '-' + i,
                            Product: models[m],
                            Color: colors[c],
                            Size: i,
                            InStock: 8
                        });
                    }
                }
            }            
            console.log(arr);
            return arr;
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

})();