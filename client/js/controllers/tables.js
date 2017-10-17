(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('TablesController', TablesController);

    TablesController.$inject = ['$scope'];
    function TablesController($scope) {

        var vm = this;
        console.log('initialized tables ctrl');
                

        vm.structuredDataSoH = false;
        vm.haveSalesData = false;

        //this array serves to define what class to add in ng-class tag in nav btns, btn-dark or btn-default
        vm.btnsArrCss = [];
        vm.viewArr = [];
        vm.viewArrSum = [];
        
        vm.getRatio = getRatio;

        init();        

        vm.showModel = function (m, arr, index) {

            vm.btnsArrCss[index] = !vm.btnsArrCss[index];
            //console.log("vm.btnsArrCss[index] = " + vm.btnsArrCss[index]);

            for (var i = 0; i < vm.viewArr.length; i++) {

                //console.log(vm.viewArr[i][0][0].Product);

                if (vm.viewArr[i][0][0].Product == m) {
                    vm.viewArr.splice(i, 1);
                    console.log('deleted');
                    return;
                }
            }

            vm.viewArr.push(arr)
            console.log("---------------viewArr------------------");
            console.log(vm.viewArr);
            console.log("----------------------------------------");

            vm.viewArrSum = countSizesAndQty(vm.viewArr, m);
            console.log(vm.viewArrSum);
            

            function countSizesAndQty(a, modelName) {

                //a = [[{}, {}], [], [], []]
                var result = {};
                
                for (var i = 0; i < a.length; i++) {
                    result[a[i][0][0].Product] = { SoldSum: 0, SoHSum: 0 };
                    for (var c = 0; c < a[i].length; c++) {

                        result[a[i][0][0].Product][a[i][c][0].Color] = {};                        

                        for (var j = 0; j < a[i][c].length; j++) {

                            result[a[i][0][0].Product][a[i][c][j].Size] = {}

                            result[a[i][0][0].Product][a[i][c][0].Color].SoH = 0;
                            result[a[i][0][0].Product][a[i][c][j].Size].SoH = 0;

                            result[a[i][0][0].Product][a[i][c][0].Color].Sold = 0;
                            result[a[i][0][0].Product][a[i][c][j].Size].Sold = 0;
                        }                        
                    }
                }

                for (var i = 0; i < a.length; i++) {
                    
                    for (var c = 0; c < a[i].length; c++) {
                        
                        for (var j = 0; j < a[i][c].length; j++) {

                            result[a[i][0][0].Product][a[i][c][0].Color].SoH += a[i][c][j].InStock;
                            result[a[i][0][0].Product][a[i][c][j].Size].SoH += a[i][c][j].InStock;

                            result[a[i][0][0].Product][a[i][c][0].Color].Sold += a[i][c][j].Sold;
                            result[a[i][0][0].Product][a[i][c][j].Size].Sold += a[i][c][j].Sold;

                            result[a[i][0][0].Product].SoHSum += a[i][c][j].InStock;
                            result[a[i][0][0].Product].SoldSum += a[i][c][j].Sold;
                        }
                    }
                }

                
                console.log(result);
                return result;
            }
        }

        function init() {            
            checkData();            
        }
        function checkData() {
            var string = '';
            var needMain = false;
            //console.log($scope.$parent.structuredDataSoH);
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

        function getRatio(a,b) {
            return parseFloat((a / b).toFixed(1));
        }
    }

})();