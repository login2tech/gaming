if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

angular
  .module('MyApp', [
    'ngRoute',
    'satellizer',
    'oitozero.ngSweetAlert',
    'angularTrix',
    'autoCompleteModule'
  ])
  .config(function($routeProvider, $locationProvider, $authProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        // controller: 'HomeCtrl',
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/home.html'
      })
      .when('/settings/', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/settings/list.html',
        controller: 'SettingCtrl'
      })
      .when('/login/', {
        resolve: {skipIfAuthenticated: skipIfAuthenticated},
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .when('/settings/edit/:id', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/settings/add.html',
        controller: 'SettingsEditCtrl'
      })
      .when('/users/', {
        resolve: {loginRequired: loginRequired},
        controller: 'UserCtrl',
        templateUrl: 'partials/users/list.html'
      })
      .when('/users/admins', {
        resolve: {loginRequired: loginRequired},
        controller: 'UserCtrl',
        templateUrl: 'partials/users/admins.html'
      })
      .when('/faq/', {
        resolve: {loginRequired: loginRequired},
        controller: 'FaqCtrl',
        templateUrl: 'partials/faq/list.html'
      })
      .when('/faq/add', {
        resolve: {loginRequired: loginRequired},
        controller: 'FaqAddCtrl',
        templateUrl: 'partials/faq/add.html'
      })
      .when('/faq/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'FaqEditCtrl',
        templateUrl: 'partials/faq/add.html'
      })

      .when('/translations/', {
        resolve: {loginRequired: loginRequired},
        controller: 'LanguageCtrl',
        templateUrl: 'partials/lang/list.html'
      })
      .when('/translations/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'LanguageEditCtrl',
        templateUrl: 'partials/lang/add.html'
      })

      .when('/plans/', {
        resolve: {loginRequired: loginRequired},
        controller: 'PlanCtrl',
        templateUrl: 'partials/plans/list.html'
      })
      .when('/plans/add', {
        resolve: {loginRequired: loginRequired},
        controller: 'PlanAddCtrl',
        templateUrl: 'partials/plans/add.html'
      })
      .when('/plans/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'PlanEditCtrl',
        templateUrl: 'partials/plans/add.html'
      })

      .when('/ladder/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'LessonCtrl',
        templateUrl: 'partials/lesson/list.html'
      })
      .when('/ladder/add/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'LessonAddCtrl',
        templateUrl: 'partials/lesson/add.html'
      })
      .when('/ladder/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'LessonEditCtrl',
        templateUrl: 'partials/lesson/add.html'
      })
      .when('/cms_pages/', {
        resolve: {loginRequired: loginRequired},
        controller: 'CMSPageCtrl',
        templateUrl: 'partials/cms_pages/list.html'
      })
      .when('/cms_pages/add', {
        resolve: {loginRequired: loginRequired},
        controller: 'CMSPageAddCtrl',
        templateUrl: 'partials/cms_pages/add.html'
      })
      .when('/cms_pages/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'CMSPageEditCtrl',
        templateUrl: 'partials/cms_pages/add.html'
      })

      .when('/games/', {
        resolve: {loginRequired: loginRequired},
        controller: 'GameCtrl',
        templateUrl: 'partials/games/list.html'
      })
      .when('/games/add', {
        resolve: {loginRequired: loginRequired},
        controller: 'GameAddCtrl',
        templateUrl: 'partials/games/add.html'
      })
      .when('/games/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'GameEditCtrl',
        templateUrl: 'partials/games/add.html'
      })

      .when('/tournaments/', {
        resolve: {loginRequired: loginRequired},
        controller: 'TournamentCtrl',
        templateUrl: 'partials/tournaments/list.html'
      })
      .when('/tournaments/add', {
        resolve: {loginRequired: loginRequired},
        controller: 'TournamentAddCtrl',
        templateUrl: 'partials/tournaments/add.html'
      })
      .when('/tournaments/edit/:id', {
        resolve: {loginRequired: loginRequired},
        controller: 'TournamentEditCtrl',
        templateUrl: 'partials/tournaments/add.html'
      })

      .when('/invoices/', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/invoices/allInvoices.html',
        controller: 'InvoiceCtrl'
      })
      .when('/submissions/', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/submissions/list.html',
        controller: 'SubmissionCtrl'
      })

      .when('/submissions/:id/votes', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/submissions/votes.html',
        controller: 'SubmissionCtrl'
      })

      .when('/invoices/:id', {
        resolve: {loginRequired: loginRequired},
        templateUrl: 'partials/invoices/allInvoices.html',
        controller: 'InvoiceCtrl'
      })

      .otherwise({
        templateUrl: 'partials/404.html'
      });

    $authProvider.loginUrl = '/login';
    $authProvider.signupUrl = '/signup';

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }

    function loginRequired($location, $auth, $http, $window) {
      if (!$auth.isAuthenticated()) {
        window.location.href = window.location.origin + '/admin_panel/login';
      }

      $http
        .get('/me')
        .then(function(res) {
          if (res.data && res.data.user) {
            if (res.data.user.status == false) {
              $auth.logout();
              delete $window.localStorage.user;
              window.location.href = window.location.origin;
            }

            // $rootScope.currentUser = response.data.user;
            // $window.localStorage. = ;
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role != 'admin') {
              window.location.href = window.location.origin + '/account';
            }
          } else {
            $auth.logout();
            delete $window.localStorage.user;
            window.location.href =
              window.location.origin + '/admin_panel/login';
          }
        })
        .catch(function(er) {
          $auth.logout();
          delete $window.localStorage.user;
          window.location.href = window.location.origin + '/admin_panel/login';
        });
    }
  })
  .run(function($rootScope, $window, $location, $auth) {
    $rootScope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
    $rootScope.urlhas = function(f) {
      return $location.$$path.indexOf(f) >= 0;
    };
  });
