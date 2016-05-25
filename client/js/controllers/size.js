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
        vm.dataBySizes = [];

        vm.getDataBySizes = getDataBySizes();
        init();



        function init() {
            checkData();
        }
        function checkData() {
            $scope.$parent.data != false ? vm.data = $scope.$parent.data : null;
            $scope.$parent.modelName != false ? vm.modelNames = $scope.$parent.modelNames : null;
        }

        function getDataBySizes() {

            var arr = vm.data;


            function getStartEndDate(ar) {
                var res = { start, end };

                res.start = ar[0].Date;
                res.end = ar[ar.length - 1].Date;
                console.log(res);
                return res;
            }
        }
    }
})();