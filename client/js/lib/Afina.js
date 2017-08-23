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
    })
    .state('colors', {
        url: '/colors',
        template: '<colors-page></colors-page>'
    }).state('pos', {
        url: '/pos',
        template: '<pos></pos>'
    })
    .state('tables', {
        url: '/tables',
        template: '<tables-page></tables-page>'
    });
 
    $urlRouterProvider.otherwise("/");
});
})();