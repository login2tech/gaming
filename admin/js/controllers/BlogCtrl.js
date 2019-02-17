angular.module('MyApp')
  .controller('BlogCtrl', function ($scope, $location, $window, $auth, BlogPost, SweetAlert) {
    $scope.blogposts = [];
    $scope.show = false;
    $scope.list = function () {
      $scope.show = false;
      BlogPost.list()
        .then(function (response) {
          // console.log(response)
          $scope.show = true;
          $scope.blogposts = response.data.posts;
          setTimeout(function () {
            $('#datatables')
              .DataTable({
                "pagingType": "full_numbers",
                "order": [[0, 'desc']],
                responsive: true,
              });
          }, 300);
        })
        .catch(function (response) {
          $scope.blogposts = [];
          $scope.show = true;
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
    $scope.list();
    $scope.requestToDelete = function (id) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Are you sure you want to delete this?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
      }, function (e) {
        if (!e) return;
        BlogPost.delete({
            id: id
          })
          .then(function (response) {
            if(typeof scrolltoTop !=='undefined') scrolltoTop();
            $scope.messages = {
              success: [response.data]
            };
            $scope.list();
          })
          .catch(function (response) {
            if(typeof scrolltoTop !=='undefined') scrolltoTop();
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
      });
    }
  });


angular.module('MyApp')
  .controller('BlogAddCtrl', function ($scope, $location, $window, $auth, BlogPost, $http, Category) {
    $scope.blogpost = {
      title: '',
      content: '',
      short_content: ''
    }
    $scope.title = 'New Blog Post';
    $scope.uploaded_images = [];
    $scope.is_new = true;
    $scope.categories = [];
    $scope.listCat = function () {
      Category.list()
        .then(function (response) {
          // console.log(response)
          $scope.categories = response.data.categories;
        })
        .catch(function (response) {
          $scope.categories = [];
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
    $scope.listCat();
    $scope.submitForm = function () {
      // $('#textarea').trigger('input');
      // $scope.blogpost.content = $('#textarea').val();
      if ($scope.blogpost.title == '' || $scope.blogpost.content == '') {
        alert('enter all fields')
        return;
      }
      BlogPost.add($scope.blogpost)
        .then(function (response) {
          $scope.messages = {
            success: [response.data]
          };
          $location.path('/blog-posts');
        })
        .catch(function (response) {
          if(typeof scrolltoTop !=='undefined') scrolltoTop();
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
  });
angular.module('MyApp')
  .controller('BlogEditCtrl', function ($scope, $location, $routeParams, $window, $auth, $http, BlogPost, Category) {
    $scope.blogpost = {
      title: '',
      content: '',
      id: $routeParams.id
    }
    $scope.title = 'Edit BlogPost';
    $scope.is_new = false;
    $scope.categories = [];
    $scope.listCat = function () {
      Category.list()
        .then(function (response) {
          // console.log(response)
          $scope.categories = response.data.categories;
        })
        .catch(function (response) {
          $scope.categories = [];
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
    $scope.listCat();
    $scope.submitForm = function () {
      if ($scope.blogpost.title == '' || $scope.blogpost.content == '') {
        alert('Please enter all fields')
        return;
      }
      BlogPost.update($scope.blogpost)
        .then(function (response) {
          if(typeof scrolltoTop !=='undefined') scrolltoTop();
          $scope.messages = {
            success: [response.data]
          };
          $scope.blogpost = response.data.blogpost
        })
        .catch(function (response) {
          if(typeof scrolltoTop !=='undefined') scrolltoTop();
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
    $scope.fetchSingle = function () {
      BlogPost.listSingle($routeParams.id)
        .then(function (response) {
          $scope.blogpost = response.data.blogpost;
        })
        .catch(function (response) {
          $scope.blogpost = {
            title: '',
            content: '',
            id: $routeParams.id
          };
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }


    $scope.fetchSingle();



    $scope.removeImage=function(){
      $scope.blogpost.image_url = '';
    }

    $scope.uploaded_images = [];
    $scope.file_upload_started = false;
    $scope.file_upload_failed = false;
    $scope.file_upload_completed = false;


    $scope.uploadedFile = function (element) {
      $scope.file_upload_started = true;
      $scope.file_upload_started = true;
      $scope.file_upload_failed = false;
      $scope.file_upload_completed = false;
      $scope.$apply(function ($scope) {
        $scope.files = element.files;
      });
      $scope.__uploadFile($scope.files);
    }
    $scope.__uploadFile = function (files) {
      var fd = new FormData();
      var url = '/fileUplaoder';
      angular.forEach(files, function (file) {
        fd.append('file', file);
      });
      var data = {
        id: 123
      };
      fd.append("data", JSON.stringify(data));
      $http.post(url, fd, {
          withCredentials: false,
          headers: {
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        })
        .success(function (data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = false;
          $scope.file_upload_completed = true;
          $scope.blogpost.image_url = data.file;
          $scope.messages = {
            success: [data]
          };
        })
        .error(function (data) {
          $scope.file_upload_started = false;
          $scope.file_upload_failed = true;
          $scope.file_upload_completed = false;
          $scope.messages = {
            error: [data]
          };
        });
    };
  });
