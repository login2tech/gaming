angular
  .module('MyApp')
  .controller('PlanCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    PLAN,
    SweetAlert
  ) {
    $scope.plans = [];
    $scope.show = false;

    $scope.list = function() {
      $scope.show = false;
      PLAN.list()
        .then(function(response) {
          // console.log(response)
          $scope.show = true;
          $scope.plans = response.data.plans;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 300);
        })
        .catch(function(response) {
          $scope.plans = [];
          $scope.show = true;
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.list();

    $scope.requestToDelete = function(id) {
      SweetAlert.swal(
        {
          title: 'Are you sure?',
          text: 'Are you sure you want to delete this?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          closeOnConfirm: false
        },
        function(e) {
          if (!e) {
            return;
          }

          PLAN.delete({
            id: id
          })
            .then(function(response) {
              $scope.messages = {
                success: [response.data]
              };
              $scope.list();
            })
            .catch(function(response) {
              $scope.messages = {
                error: Array.isArray(response.data)
                  ? response.data
                  : [response.data]
              };
            });
        }
      );
    };
  });

angular
  .module('MyApp')
  .controller('PlanAddCtrl', function($scope, $location, $window, $auth, PLAN) {
    $scope.plan = {
      title: '',
      content: ''
    };
    $scope.title = 'New Plan';
    $scope.submitForm = function() {
      // if ($scope.plan.title == '' || $scope.plan.cost == '')
      //   return;
      PLAN.add($scope.plan)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/plans');
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
  });

angular
  .module('MyApp')
  .controller('PlanEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    PLAN
  ) {
    $scope.plan = {
      title: '',
      content: '',
      id: $routeParams.id
    };
    $scope.title = 'Edit Plan';
    $scope.submitForm = function() {
      // if ($scope.plan.title == '' || $scope.plan.cost == '')
      //   return;
      PLAN.update($scope.plan)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $('html, body').animate(
            {
              scrollTop: 0
            },
            'slow'
          );
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
      PLAN.listSingle($routeParams.id)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          console.log(response);
          $scope.plan = response.data.plan;
          $scope.plan.cost = parseFloat($scope.plan.cost);
        })
        .catch(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.plan = {
            title: '',
            id: $routeParams.id
          };
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.fetchSingle();
  });
