(function(){
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

angular.module('Afina').directive('sizesPage', function () {
    return {
        restrict: 'EA',
        templateUrl: 'client/partials/sizes.html'
    }
});

angular.module('Afina').directive('colorsPage', function () {
    return {
        restrict: 'EA',
        templateUrl: 'client/partials/colors.html'
    }
});

angular.module('Afina').directive('ordersByModels', function () {
    return {
        restrict: 'EA',
        templateUrl: 'client/partials/orders-by-models.html'
    }
});

angular.module('Afina').directive('pos', function () {
    return {
        restrict: 'EA',
        templateUrl: 'client/partials/pos.html'
    }
});

angular.module('Afina').directive('tablesPage', function () {
    return {
        restrict: 'EA',
        templateUrl: 'client/partials/tables.html'
    }
});
    
})();

