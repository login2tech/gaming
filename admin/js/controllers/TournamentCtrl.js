angular
  .module('MyApp')
  .controller('TournamentCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Tournament,
    SweetAlert
  ) {
    $scope.items = [];
    $scope.show = false;
    $scope.list = function() {
      $scope.show = false;
      Tournament.list()
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
          Tournament.delete({
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
  .controller('TournamentAddCtrl', function(
    $scope,
    $location,
    $window,
    $auth,
    Tournament,
    Game,
    $http
  ) {
    $scope.fetchGames = function() {
      Game.list()
        .then(function(response) {
          $scope.games = response.data.items;
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };

    $scope.fetchGames();

    $scope.item = {
      title: ''
    };
    $scope.title = 'New Tournament';
    $scope.uploaded_images = [];
    $scope.is_new = true;
    $scope.categories = [];
    $scope.submitForm = function() {
      if ($scope.item.title == '') {
        alert('enter all fields');
        return;
      }
      Tournament.add($scope.item)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/tournaments');
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

    $scope.updatePlayersCnt = function()
    {
      for (let i = 0 ; i < $scope.games.length;i++)
      {
        if($scope.games[i].id == $scope.item.game_id)
        {
          for (let j = 0 ; j < $scope.games[i].ladders.length;j++)
          {
            if($scope.games[i].ladders[j].id == $scope.item.ladder_id)
            {
              // alert()
              $scope.min_players = $scope.games[i].ladders[j].min_players;
              $scope.max_players = $scope.games[i].ladders[j].max_players;
              $scope.types = [];
              for(let k = $scope.min_players;k<= $scope.max_players;k++)
              {
                $scope.types.push(k);
              }
            }
          }
        }
      }
    }

    $scope.removeImage = function() {
      $scope.item.image_url = '';
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
          $scope.item.image_url = data.file;
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
  .controller('TournamentEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $window,
    $auth,
    $http,
    Tournament,
    Game
  ) {
    $scope.fetchGames = function() {
      Game.list()
        .then(function(response) {
          $scope.games = response.data.items;
          $scope.fetchSingle();
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
          $scope.fetchSingle();
        });
    };

    $scope.fetchGames();

    $scope.item = {
      title: '',
      content: '',
      id: $routeParams.id
    };
    $scope.title = 'Edit Tournament';
    $scope.is_new = false;

    $scope.submitForm = function() {
      if ($scope.item.title == '' || $scope.item.content == '') {
        alert('Please enter all fields');
        return;
      }
      Tournament.update($scope.item)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $scope.item = response.data.item;
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
      Tournament.listSingle($routeParams.id)
        .then(function(response) {
          $scope.item = response.data.item;
          $scope.item.registration_start_at = moment(
            $scope.item.registration_start_at
          ).format('lll');
          $scope.item.registration_end_at = moment(
            $scope.item.registration_end_at
          ).format('lll');
          $scope.item.starts_at = moment($scope.item.starts_at).format('lll');
        })
        .catch(function(response) {
          $scope.item = {
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

    $scope.removeImage = function() {
      $scope.item.image_url = '';
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
          $scope.item.image_url = data.file;
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
