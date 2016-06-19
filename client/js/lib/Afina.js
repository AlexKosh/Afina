(function(){
    angular.module('Afina', ['angular-meteor', 'ui.router', 'ngAnimate']);

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
      })
    .state('sizes', {
        url: '/sizes',
        template: '<sizes-page></sizes-page>'
    });
 
    $urlRouterProvider.otherwise("/");
});
})();