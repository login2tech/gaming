angular
  .module('MyApp')
  .controller('FaqCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    FAQ,
    SweetAlert
  ) {
    $scope.faqs = [];
    $scope.show = false;

    $scope.list = function() {
      $scope.show = false;
      FAQ.list()
        .then(function(response) {
          // console.log(response)
          $scope.show = true;
          $scope.faqs = response.data.faqs;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 300);
        })
        .catch(function(response) {
          $scope.faqs = [];
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

          FAQ.delete({
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
  .controller('FaqAddCtrl', function($scope, $location, $window, $auth, FAQ) {
    $scope.faq = {
      title: '',
      content: ''
    };
    $scope.title = 'New FAQ';
    $scope.submitForm = function() {
      if ($scope.faq.title == '' || $scope.faq.content == '') {
        return;
      }
      FAQ.add($scope.faq)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/faq');
        })
        .catch(function(response) {
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
  .controller('FaqEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    FAQ
  ) {
    $scope.faq = {
      title: '',
      content: '',
      id: $routeParams.id
    };
    $scope.title = 'Edit FAQ';
    $scope.submitForm = function() {
      if ($scope.faq.title == '' || $scope.faq.content == '') {
        return;
      }
      FAQ.update($scope.faq)
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
      FAQ.listSingle($routeParams.id)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          console.log(response);
          $scope.faq = response.data.faq;
        })
        .catch(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.faq = {
            title: '',
            content: '',
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
