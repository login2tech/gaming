angular.module('MyApp')
  .controller('HeaderCtrl', function($scope, $location, $window, $auth) {
    lbd.checkSidebarImage();

    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/login');
    };


  });
