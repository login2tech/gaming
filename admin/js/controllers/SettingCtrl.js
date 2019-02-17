angular.module('MyApp')
  .controller('SettingCtrl', function($scope, $location, $window, $auth, Settings, SweetAlert) {
    $scope.settings = [ ];
    $scope.show = false;

    $scope.list = function(){
      $scope.show = false;
      Settings.list()
      .then(function(response) {
        $scope.show = true;
          $scope.settings = response.data.settings;
          setTimeout(function(){
            $('#datatables').DataTable({
              "pagingType": "full_numbers","order": [[ 0, 'desc' ]],
              responsive: true,
          });
        }, 300);
      })
      .catch(function(response) {
          $scope.settings = [ ];
          $scope.show = true;
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }
    $scope.list();


    $scope.requestToDelete = function(id)
    {
      return;
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to delete this?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, delete it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        FAQ.delete({id:id})
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
          $scope.list();
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });

      });
    }


  });
//
//
// angular.module('MyApp')
//   .controller('FaqAddCtrl', function($scope, $location, $window, $auth, FAQ) {
//     $scope.faq = {title: '', content: ''}
//     $scope.title = 'New FAQ';
//     $scope.submitForm = function(){
//       if($scope.faq.title == '' || $scope.faq.content == '')
//         return;
//       FAQ.add($scope.faq)
//       .then(function(response) {
//         $scope.messages = {
//           success: [response.data]
//         };
//         $location.path('/faq');
//       })
//       .catch(function(response) {
//         $scope.messages = {
//           error: Array.isArray(response.data) ? response.data : [response.data]
//         };
//       });
//     }
//   });
//
//
//

angular.module('MyApp')
  .controller('SettingsEditCtrl', function($scope, $location,$routeParams, $window, $auth, $http, Settings) {
    $scope.settings = {key: '', content: '', id:$routeParams.id }
    $scope.title = 'Edit Setting Item';



    $scope.submitForm = function(){


      if(  $scope.settings.content == '')
        return;
      Settings.update($scope.settings)
      .then(function(response) {
        $scope.messages = {
          success: [response.data]
        };
        // $location.path('/faq');
      })
      .catch(function(response) {
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }

    $scope.fetchSingle = function(){
      Settings.listSingle($routeParams.id)
      .then(function(response) {
        // console.log(response)
          $scope.settings = response.data.settings;

    // setTimeout(function(){
      // if($scope.settings.type == 'wysiwyg'){
        // var editor  = $('#my_textarea').wysihtml5();
        // $('#my_textarea').html($scope.settings.content);
      // }
    // }, 200);





      })
      .catch(function(response) {
        $scope.settings = {key: '', content: '', id:$routeParams.id };
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }
    $scope.fetchSingle();








		$scope.uploadedFile = function(element)
    {
     // console.log(jQuery(element).attr('data-id_key'))
      $scope.file_upload_booking_id = jQuery(element).attr('data-id_key');
      // console.log( $scope.file_upload_booking_id )
      $scope.file_upload_started = true;
      $scope.$apply(function($scope)
      {
        $scope.files = element.files;
      });
      $scope.addFile();
    }

    $scope.addFile = function()
    {
      $scope.uploadfile($scope.files);
    }

		$scope.uploadfile = function(files)
    {

      var fd = new FormData();

      var url = '/settings/edit/file';

      angular.forEach(files, function(file)
      {
        fd.append('file', file);
      });

      //sample data

     // console.log( $scope.file_upload_booking_id )
      var data = {key : $scope.file_upload_booking_id};

      fd.append("data", JSON.stringify(data));

      $http.post(url, fd,
        {
          withCredentials: false,
          headers:
          {
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        })
        .success(function(data)
        {
					$scope.file_upload_started = false;
          // console.log(data);
          $scope.messages = {
            success: [data]
          };

        })
        .error(function(data)
        {
					$scope.file_upload_started = false;
          // console.log(data);
          $scope.messages = {
            error: [data]
          };
        });
    };









  });
