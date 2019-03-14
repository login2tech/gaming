angular
  .module('MyApp')
  .controller('LessonCtrl', function(
    $scope,
    $location,
    $routeParams,
    $auth,
    Lesson,
    SweetAlert
  ) {
    $scope.show = false;
    $scope.items = [];
    $scope.ELEMENENT = 'Ladder';
    $scope.courseId = $routeParams.id;
    $scope.list = function(course_id) {
      $scope.show = false;
      Lesson.list(course_id)
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
    $scope.list($routeParams.id);
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
          Lesson.delete({
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
  .controller('LessonAddCtrl', function(
    $scope,
    $location,
    $routeParams,
    $auth,
    $http,
    Lesson
  ) {
    $scope.is_new = true;
    $scope.courseId = $routeParams.id;
    $scope.item = {
      title: '',
      id: $routeParams.id,
      course_id: $routeParams.id,
      description: '',
      quiz_data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    };
    $scope.ELEMENENT = 'Ladder';
    $scope.title = 'New Ladder';
    $scope.loading = false;
    $scope.submitForm = function() {
      if ($scope.item.title == '') {
        return;
      }
      Lesson.add($scope.item)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/ladder/' + $scope.courseId);
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
  .controller('LessonEditCtrl', function(
    $scope,
    $location,
    $routeParams,
    $http,
    $auth,
    Lesson
  ) {
    $scope.is_new = false;
    $scope.item = {
      title: '',
      id: $routeParams.id,
      course_id: $routeParams.id,
      description: '',
      quiz_data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    };
    $scope.title = 'Edit Lesson';
    $scope.loading = false;
    $scope.submitForm = function() {
      if ($scope.item.title == '') {
        return;
      }
      Lesson.update($scope.item)
        .then(function(response) {
          if (typeof scrolltoTop !== 'undefined') {
            scrolltoTop();
          }
          $scope.messages = {
            success: [response.data]
          };
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
      Lesson.listSingle($routeParams.id)
        .then(function(response) {
          $scope.item = response.data.item;
          if (!$scope.item.attachment_1) {
            $scope.item.attachment_1 = [];
          } else {
            $scope.item.attachment_1 = JSON.parse($scope.item.attachment_1);
          }
        })
        .catch(function(response) {
          $scope.item = {
            title: '',
            id: $routeParams.id,
            quiz_data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
          };
          $scope.messages = {
            error: Array.isArray(response.data)
              ? response.data
              : [response.data]
          };
        });
    };
    $scope.fetchSingle();

    $scope.item.attachment_1 = [];

    $scope.removeImage = function(i) {
      $scope.item.attachment_1.splice(i, 1);
      // $scope.item.image_url = '';
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
      const url = '/fileUplaoder';
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
          $scope.item.attachment_1.push(data.file);
          // $('.file_form').first().reset();
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
