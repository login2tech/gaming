angular
  .module('MyApp')
  .controller('LanguageCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Languages
  ) {
    $scope.items = [];
    $scope.show = false;

    $scope.list = function() {
      $scope.show = false;
      Languages.list()
        .then(function(response) {
          $scope.show = true;
          $scope.items = response.data.items;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 300);
        })
        .catch(function(response) {
          $scope.items = [];
          $scope.show = true;
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.list();
  });

angular
  .module('MyApp')
  .controller('LanguageEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    Languages
  ) {
    $scope.item = {l_1: '', l_2: '', id: $routeParams.id};
    $scope.title = 'Edit Translation';
    $scope.submitForm = function() {
      if ($scope.item.l_1 == '') {
        return;
      }
      Languages.update($scope.item)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          // $location.path('/faq');
        })
        .catch(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };

    $scope.fetchSingle = function() {
      Languages.listSingle($routeParams.id)
        .then(function(response) {
          $scope.item = response.data.item;
        })
        .catch(function(response) {
          $scope.item = {title: '', id: $routeParams.id};
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.fetchSingle();
  });
