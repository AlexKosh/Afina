(function () {

    //Afina MainController
    angular.module('Afina')
        .controller('OrdersByModelsController', OrdersByModelsController);

    OrdersByModelsController.$inject = ['$scope'];
    function OrdersByModelsController($scope) {

        var vm = this;
        console.log('initialized OrdersByModels ctrl');

        vm.data = [];
        vm.modelNames = [];

        vm.modelsArr = [];
        vm.OrdersArr = [];
        vm.comparedArr = [];        
        
        //counts width for progress bars style
        vm.countWidth = function (model, cModel, index) {

            var x = {}

            x.sum = model.SoldQtyA + cModel.SoldQtyB;
            x["A"] = (model.SoldQtyA - cModel.SoldQtyAB) / x.sum * 100;
            x["B"] = (cModel.SoldQtyB - cModel.SoldQtyBA) / x.sum * 100;
            x["AB"] = cModel.SoldQtyAB / x.sum * 100;
            x["BA"] = cModel.SoldQtyBA / x.sum * 100;
            
            if (index == 1) {
                return x["A"] + "%";
            }
            if (index == 2) {
                return x["AB"] + "%";
            }
            if (index == 3) {
                return x["BA"] + "%";
            }
            if (index == 4) {
                return x["B"] + "%";
            }
        }

        init();
        
        function init() {
            checkData();

            fillmodelsAndOrdersArr();
            vm.comparedArr = getComparedModelsOrders();
        }
        function checkData() {
            var string = '';
            var needMain = false;

            $scope.$parent.data != false ? vm.data = $scope.$parent.data : backToMain('error: vm.data == undefined!');
            $scope.$parent.modelNames != false ? vm.modelNames = $scope.$parent.modelNames : backToMain('error: vm.modelNames == undefined!');

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

        function fillmodelsAndOrdersArr() {

            vm.modelsArr = fillModelsArr(vm.modelNames, vm.data);

            vm.OrdersArr = fillOrdersArr(vm.data);

            function fillModelsArr(namesArr, data) {
                newArr = [];

                newArr.push({
                    Name: data[0].Name,
                    SoldQty: data[0].Quantity,
                    OrdQty: 1,
                    LastOrd: data[0].OrderNumber
                });
                
                for (var i = 1; i < data.length; i++) {

                    for (var j = 0; j < newArr.length; j++) {

                        if (newArr[j].Name == data[i].Name) {

                            newArr[j].SoldQty += data[i].Quantity;

                            if (newArr[j].LastOrd == data[i].OrderNumber) {
                                break;
                            } else {
                                newArr[j].OrdQty += 1;
                                newArr[j].LastOrd = data[i].OrderNumber;
                            }

                            break;
                        }

                        if ((newArr.length - 1) == j) {
                            newArr.push({
                                Name: data[i].Name,
                                SoldQty: data[i].Quantity,
                                OrdQty: 1,
                                LastOrd: data[i].OrderNumber
                            });
                            break;
                        }
                    }                    
                }

                //console.log(newArr);

                newArr.sort(function (a, b) {
                    return b.SoldQty - a.SoldQty;
                });
                return newArr;
            }
            function fillOrdersArr(data) {
                var ordsArr = [];

                for (var i = 0; i < data.length; i++) {

                    //init of ordsArr when ordsArr.lenght == 0
                    if (ordsArr.length == 0) {
                        ordsArr.push({
                            OrderNumber: data[i].OrderNumber,
                            Models: [{
                                Name: data[i].Name,
                                Qty: data[i].Quantity
                            }],
                            Customer: data[i].Customer,
                            Date: data[i].Date
                            
                        });
                        continue;
                    }

                    for (var j = 0; j < ordsArr.length; j++) {

                        if (ordsArr[j].OrderNumber == data[i].OrderNumber) {

                            addQtyToModelsInOrdsArr(ordsArr[j].Models, data[i].Name, data[i].Quantity);
                            break;
                        }

                        if (j == (ordsArr.length - 1)) {
                            ordsArr.push({
                                OrderNumber: data[i].OrderNumber,
                                Models: [{
                                    Name: data[i].Name,
                                    Qty: data[i].Quantity
                                }],
                                Customer: data[i].Customer,
                                Date: data[i].Date
                            });
                            break;
                        }
                    }
                }

                //console.log(ordsArr);
                return ordsArr;

                //Array of models from this order, model Name, Qty to add
                function addQtyToModelsInOrdsArr(a, n, q) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i].Name == n) {
                            a[i].Qty += q;
                            return;
                        }

                        if (i == (a.length - 1)) {
                            a.push({
                                Name: n,
                                Qty: q
                            });
                            return;
                        }
                    }
                }
            }
        }

        function getComparedModelsOrders() {
            
            //at first, lets create top-x models list
            var howManyModels = vm.modelNames.length;
            var modelNamesList = [];
            var result = {};

            if (vm.modelNames.length > 20) {
                howManyModels = vm.modelNames.length / 3;
            }

            for (var x = 0; x < howManyModels; x++) {
                modelNamesList.push(vm.modelsArr[x].Name);
            }
            //console.log("MODELSNAMESLIST:");
            //console.log(modelNamesList);
                        
            result = createComparedArr(modelNamesList);
            result = getComparedArr(result);

            console.log(result);
            return result;

            function createComparedArr(nList) {
                
                var x = [];

                for (var i = 0; i < nList.length; i++) {

                    x.push({
                        ModelName: nList[i],
                        SoldQtyA: 0,
                        OrdQtyA: 0,
                        cListA: [],
                        cData: []
                    });

                    for (var j = 0; j < nList.length; j++) {

                        x[i].cData.push(
                            {
                                ModelName: nList[j],
                                SoldQtyB: 0,
                                SoldQtyAB: 0,
                                SoldQtyBA: 0,
                                OrdQtyB: 0,
                                OrdQtyC: 0,
                                cListB: [],
                                cListC: []
                            });
                    }
                }

                //console.log(x);
                return x;
            }

            function compareModelsOrders(a, b) {
                var x = {
                    ModelNameA: a,
                    ModelNameB: b,

                    SoldQtyA: 0,
                    OrdQtyA: 0,

                    SoldQtyB: 0,                    
                    OrdQtyB: 0,

                    SoldQtyAWithB: 0,
                    SoldQtyBWithA: 0,
                    OrdQtyBWithA: 0,

                    CustomersListA: [],
                    CustomersListB: [],
                    CustomersListC: []
                };

                var detectedA = false;
                var detectedB = false;
                var tSoldA = 0;
                var tSoldB = 0;

                for (var i = 0; i < vm.OrdersArr.length; i++) {

                    if (vm.OrdersArr[i].Models.length > 1) {

                        for (var j = 0; j < vm.OrdersArr[i].Models.length; j++) {
                                                        
                            if (vm.OrdersArr[i].Models[j].Name == a) {
                                //x.SoldQtyA += vm.OrdersArr[i].Models[j].Qty;
                                tSoldA += vm.OrdersArr[i].Models[j].Qty;
                                x.OrdQtyA += 1;
                                x.CustomersListA.push(vm.OrdersArr[i].Customer);
                                detectedA = true;
                                //continue;
                            }

                            if (vm.OrdersArr[i].Models[j].Name == b) {
                                //x.SoldQtyB += vm.OrdersArr[i].Models[j].Qty;
                                tSoldB += vm.OrdersArr[i].Models[j].Qty;
                                x.OrdQtyB += 1;
                                x.CustomersListB.push(vm.OrdersArr[i].Customer);
                                detectedB = true;
                                //continue;
                            }

                            if (j == (vm.OrdersArr[i].Models.length - 1)) {

                                if (detectedA && detectedB) {
                                    x.SoldQtyAWithB += tSoldA;
                                    x.SoldQtyBWithA += tSoldB;
                                    x.OrdQtyBWithA += 1;
                                    x.CustomersListC.push(vm.OrdersArr[i].Customer);
                                }
                                x.SoldQtyA += tSoldA;
                                x.SoldQtyB += tSoldB;

                                tSoldA = 0;
                                tSoldB = 0;
                                detectedA = false;
                                detectedB = false;
                                break;
                            }
                        }

                    } else {
                        if (vm.OrdersArr[i].Models[0].Name == a) {
                            x.SoldQtyA += vm.OrdersArr[i].Models[0].Qty;
                            //tSoldA += vm.OrdersArr[i].Models[j].Qty;
                            x.OrdQtyA += 1;
                            x.CustomersListA.push(vm.OrdersArr[i].Customer);
                            //detectedA = true;
                            //continue;
                        }

                        if (vm.OrdersArr[i].Models[0].Name == b) {
                            x.SoldQtyB += vm.OrdersArr[i].Models[0].Qty;
                            //tSoldB += vm.OrdersArr[i].Models[j].Qty;
                            x.OrdQtyB += 1;
                            x.CustomersListB.push(vm.OrdersArr[i].Customer);
                            //detectedB = true;
                            //continue;
                        }
                    }
                    
                }

                //console.log(x);
                return x;
            }

            function getComparedArr(res) {
                var z = res;
                var compared = {};
                var y = {
                    ModelName: "A",
                    SoldQtyA: 0,
                    OrdQtyA: 0,
                    cListA: [],
                    cData: [
                        {
                            ModelName: "B",
                            SoldQtyB: 0,
                            SoldQtyAB: 0,
                            SoldQtyBA: 0,
                            OrdQtyB: 0,
                            OrdQtyC: 0,
                            cListB: [],
                            cListC: []
                        }
                    ]
                };
                for (var i = 0; i < modelNamesList.length; i++) {
                    for (var j = 0; j < modelNamesList.length; j++) {

                        if (modelNamesList[i] == modelNamesList[j]) {
                            continue;
                        }
                        compared = compareModelsOrders(modelNamesList[i], modelNamesList[j]);

                        z[i].ModelName = compared.ModelNameA;
                        z[i].SoldQtyA = compared.SoldQtyA;
                        z[i].OrdQtyA = compared.OrdQtyA;
                        z[i].cListA = compared.CustomersListA;

                        z[i].cData[j].ModelName = compared.ModelNameB;
                        //кол-во проданных курток Б
                        z[i].cData[j].SoldQtyB = compared.SoldQtyB;
                        //как много продалось курток А в заказах где есть Б
                        z[i].cData[j].SoldQtyAB = compared.SoldQtyAWithB;
                        //как много продалось курток Б в заказах где есть А
                        z[i].cData[j].SoldQtyBA = compared.SoldQtyBWithA;
                        //кол-во заказов где есть Б
                        z[i].cData[j].OrdQtyB = compared.OrdQtyB;
                        //кол-во заказов где есть куртки А и Б
                        z[i].cData[j].OrdQtyC = compared.OrdQtyBWithA;
                        //список клиентов купивших куртку Б хоть раз
                        z[i].cData[j].cListB = compared.CustomersListB;
                        //список клиентов купивших куртки А и Б одним заказом хотя бы раз
                        z[i].cData[j].cListC = compared.CustomersListC;
                    }
                }

                return z;
            }
        }

        vm.getOrdQtySum = function () {
            var result = 0;
            for (var i = 0; i < vm.modelsArr.length; i++) {
                result += vm.modelsArr[i].OrdQty;
            }

            return result;
        }
        vm.getSoldSum = function () {
            var result = 0;
            for (var i = 0; i < vm.modelsArr.length; i++) {
                result += vm.modelsArr[i].SoldQty;
            }

            return result;
        }
        vm.getAvgSoldPerOrd = function (a, b) {
            return parseFloat((a / b).toFixed(1));
        }
    }
})();