angular.module('MyApp').controller('HomeCtrl', function($scope, NOTIFS) {
  $scope.notifs = [];
  $scope.show = false;

  $scope.list = function() {
    $scope.show = false;
    NOTIFS.send()
      .then(function(response) {
        // console.log(response)
        $scope.show = true;
        $scope.notifs = response.data.notifs;
      })
      .catch(function(response) {
        $scope.notifs = [];
        $scope.show = true;
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
  };
  $scope.list();
  $scope.delete = function(id) {
    NOTIFS.delete({id: id})
      .then(function(response) {
        $scope.messages = {
          success: [response.data]
        };
        $scope.list();
      })
      .catch(function(response) {
        // $scope.messages = {
        //   error: Array.isArray(response.data) ? response.data : [response.data]
        // };
      });
  };
});

angular
  .module('MyApp')

  .controller('CMSPageCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    CMSPage,
    SweetAlert
  ) {
    $scope.cms_pages = [];
    $scope.show = false;

    $scope.list = function() {
      $scope.show = false;
      CMSPage.list()
        .then(function(response) {
          // console.log(response)
          $scope.show = true;
          $scope.cms_pages = response.data.cms_pages;
          setTimeout(function() {
            $('#datatables').DataTable({
              pagingType: 'full_numbers',
              order: [[0, 'desc']],
              responsive: true
            });
          }, 300);
        })
        .catch(function(response) {
          $scope.cms_pages = [];
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

          CMSPage.delete({
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
  .controller('CMSPageAddCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    CMSPage
  ) {
    $scope.cms_pages = {
      title: '',
      content: ''
    };
    $scope.title = 'New CMSPage';
    $scope.submitForm = function() {
      if ($scope.cms_page.title == '' || $scope.cms_page.content == '') {
        return;
      }
      CMSPage.add($scope.cms_page)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/cms_pages');
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
  .controller('CMSPageEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    CMSPage
  ) {
    $scope.cms_pages = {
      title: '',
      content: '',
      id: $routeParams.id
    };
    $scope.title = 'Edit CMSPage';
    $scope.submitForm = function() {
      if ($scope.cms_page.title == '' || $scope.cms_page.content == '') {
        return;
      }
      CMSPage.update($scope.cms_page)
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
      CMSPage.listSingle($routeParams.id)
        .then(function(response) {
          // console.log(response)
          $scope.cms_page = response.data.cms_page;
        })
        .catch(function(response) {
          $scope.cms_pages = {
            title: '',
            content: '',
            id: $routeParams.id,
            is_in_link: 'no'
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
