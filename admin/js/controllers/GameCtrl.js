angular
  .module('MyApp')
  .controller('GameCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Game,
    SweetAlert
  ) {
    $scope.games = [];
    $scope.show = false;
    $scope.list = function() {
      $scope.show = false;
      Game.list()
        .then(function(response) {
          // console.log(response)
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
          $scope.games = [];
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
          Game.delete({
            id: id
          })
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
  .controller('GameAddCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Game,
    $http
  ) {
    $scope.game = {
      title: '',
      content: '',
      short_content: ''
    };
    $scope.title = 'New Game';
    $scope.uploaded_images = [];
    $scope.is_new = true;
    $scope.categories = [];

    $scope.submitForm = function() {
      // $('#textarea').trigger('input');
      // $scope.game.content = $('#textarea').val();
      if ($scope.game.title == '') {
        alert('enter all fields');
        return;
      }
      Game.add($scope.game)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/games');
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

    $scope.removeImage = function() {
      $scope.game.image_url = '';
    };

    $scope.uploaded_images = [];
    $scope.file_upload_started = false;
    $scope.file_upload_failed = false;
    $scope.file_upload_completed = false;

    $scope.uploadedFile = function(element) {
      $scope.file_upload_started = true;
      $scope.file_upload_started = true;
      $scope.file_upload_failed = false;
      $scope.file_upload_completed = false;
      $scope.$apply(function($scope) {
        $scope.files = element.files;
      });
      $scope.__uploadFile($scope.files);
    };
    $scope.__uploadFile = function(files) {
      const fd = new FormData();
      const url = '/upload';
      angular.forEach(files, function(file) {
        fd.append('file', file);
      });
      const data = {
        id: 123
      };
      fd.append('data', JSON.stringify(data));
      $http
        .post(url, fd, {
          withCredentials: false,
          headers: {
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        })
        .success(function(data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = false;
          $scope.file_upload_completed = true;
          $scope.game.image_url = data.file;
          $scope.messages = {
            success: [data]
          };
        })
        .error(function(data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = true;
          $scope.file_upload_completed = false;
          $scope.messages = {
            error: [data]
          };
        });
    };
  });

angular
  .module('MyApp')
  .controller('GameEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    $http,
    Game
  ) {
    $scope.game = {
      title: '',
      content: '',
      id: $routeParams.id
    };
    $scope.title = 'Edit Game';
    $scope.is_new = false;

    $scope.submitForm = function() {
      if ($scope.game.title == '' || $scope.game.content == '') {
        alert('Please enter all fields');
        return;
      }
      Game.update($scope.game)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $scope.game = response.data.game;
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
      Game.listSingle($routeParams.id)
        .then(function(response) {
          $scope.game = response.data.item;
        })
        .catch(function(response) {
          $scope.game = {
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

    $scope.removeImage = function() {
      $scope.game.image_url = '';
    };

    $scope.uploaded_images = [];
    $scope.file_upload_started = false;
    $scope.file_upload_failed = false;
    $scope.file_upload_completed = false;

    $scope.uploadedFile = function(element) {
      $scope.file_upload_started = true;
      $scope.file_upload_started = true;
      $scope.file_upload_failed = false;
      $scope.file_upload_completed = false;
      $scope.$apply(function($scope) {
        $scope.files = element.files;
      });
      $scope.__uploadFile($scope.files);
    };
    $scope.__uploadFile = function(files) {
      const fd = new FormData();
      const url = '/upload';
      angular.forEach(files, function(file) {
        fd.append('file', file);
      });
      const data = {
        id: 123
      };
      fd.append('data', JSON.stringify(data));
      $http
        .post(url, fd, {
          withCredentials: false,
          headers: {
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        })
        .success(function(data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = false;
          $scope.file_upload_completed = true;
          $scope.game.image_url = data.file;
          $scope.messages = {
            success: [data]
          };
        })
        .error(function(data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = true;
          $scope.file_upload_completed = false;
          $scope.messages = {
            error: [data]
          };
        });
    };
  });
