(function () {
    
    //Afina MainController
    angular.module('Afina')
        .controller('TablesController', TablesController);

    TablesController.$inject = ['$scope'];
    function TablesController($scope) {

        var vm = this;
        console.log('initialized tables ctrl');

        vm.ShowSales = true;
        vm.ShowStock = true;

        vm.structuredDataSoH = false;
        vm.haveSalesData = false;

        init();

        $scope.doWork = function (obj) {
            obj.Sold = 150;
            console.log(obj);
            console.log(vm.structuredDataSoH);
        }

        function init() {            
            checkData();
        }
        function checkData() {
            var string = '';
            var needMain = false;
            console.log($scope.$parent.structuredDataSoH);
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

    }

})();