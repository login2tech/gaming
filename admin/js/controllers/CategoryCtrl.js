angular
  .module('MyApp')
  .controller('SubmissionCtrl', function(
    $scope,
    $routeParams,
    $location,
    $window,
    $auth,
    Submissions,
    SweetAlert
  ) {
    $scope.items = [];
    $scope.show = false;
    $scope.formatted_date = function(item) {
      return moment.unix(item).format('llll');
    };

    $scope.requestToBan = function(id) {
      SweetAlert.swal(
        {
          title: 'Are you sure?',
          text: 'Are you sure you want to ban this listing?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, do it!',
          closeOnConfirm: false
        },
        function(e) {
          if (!e) {
            return;
          }

          Submissions.ban(id)
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
    $scope.list = function(val) {
      $scope.show = false;
      Submissions.list(val)
        .then(function(response) {
          if (val) {
            $scope.is_single = true;
          } else {
            $scope.is_single = false;
          }
          $scope.show = true;
          $scope.items = response.data;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 1000);
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

    $scope.listVotes = function(val) {
      $scope.show = false;
      Submissions.votes(val)
        .then(function(response) {
          if (val) {
            $scope.is_single = true;
          } else {
            $scope.is_single = false;
          }
          $scope.show = true;
          $scope.items = response.data;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 1000);
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

    if ($routeParams.id) {
      $scope.listVotes($routeParams.id);
    } else {
      $scope.list(false);
    }
  })

  .controller('InvoiceCtrl', function(
    $scope,
    $routeParams,
    $location,
    $window,
    $auth,
    Invoice
  ) {
    $scope.items = [];
    $scope.show = false;
    $scope.formatted_date = function(item) {
      return moment.unix(item).format('llll');
    };
    $scope.list = function(val) {
      $scope.show = false;
      Invoice.list(val)
        .then(function(response) {
          if (val) {
            $scope.is_single = true;
          } else {
            $scope.is_single = false;
          }
          $scope.show = true;
          $scope.items = response.data.items;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 1000);
        })
        .catch(function(response) {
          $scope.categories = [];
          $scope.show = true;
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    if ($routeParams.id) {
      $scope.list($routeParams.id);
    } else {
      $scope.list(false);
    }
  });

angular
  .module('MyApp')
  .controller('CategoryCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Category,
    SweetAlert
  ) {
    $scope.categories = [];
    $scope.show = false;

    $scope.list = function() {
      $scope.show = false;
      Category.list()
        .then(function(response) {
          $scope.show = true;
          $scope.categories = response.data.categories;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 300);
        })
        .catch(function(response) {
          $scope.categories = [];
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

          Category.delete({id: id})
            .then(function(response) {
              if (typeof scrolltoTop !== 'undefined') {
                scrolltoTop();
              }
              $scope.messages = {
                success: [response.data]
              };
              $scope.list();
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
        }
      );
    };
  });

angular
  .module('MyApp')
  .controller('CategoryAddCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Category
  ) {
    $scope.category = {title: ''};
    $scope.title = 'New Category';
    $scope.submitForm = function() {
      if ($scope.category.title == '') {
        return;
      }
      Category.add($scope.category)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/category');
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
  .controller('CategoryEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    Category
  ) {
    $scope.category = {title: '', id: $routeParams.id};
    $scope.title = 'Edit Category';
    $scope.submitForm = function() {
      if ($scope.category.title == '') {
        return;
      }
      Category.update($scope.category)
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
      Category.listSingle($routeParams.id)
        .then(function(response) {
          $scope.category = response.data.category;
        })
        .catch(function(response) {
          $scope.category = {title: '', id: $routeParams.id};
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.fetchSingle();
  });
