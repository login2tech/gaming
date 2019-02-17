

angular.module('MyApp')
  .controller('UserCtrl', function($scope, $location, $rootScope, $window, $auth, User, SweetAlert) {
    $scope.users = [ ];
    $scope.show = false;
    $scope.cur_id  = $rootScope.currentUser.id;

    $scope.list = function(){

      $scope.show = false;

      User.list()
      .then(function(response) {
        // console.log(response)
        $scope.show = true;
          $scope.users = response.data.users;
          setTimeout(function(){
            $('#datatables').DataTable({
              "pagingType": "full_numbers","order": [[ 0, 'desc' ]],
              responsive: true,
          });$('#datatables2').DataTable({
            "pagingType": "full_numbers","order": [[ 0, 'desc' ]],
            responsive: true,
        });
        }, 300);
      })
      .catch(function(response) {
          $scope.users = [ ];
          $scope.show = true;
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }
    $scope.list();


    $scope.printKYC = function(src)
    {


      if(newWin)
        newWin = null;
      var newWin = window.open('','Print-Window');
      // newWin.document.open();
      // newWin.document.write('<html><head><title>KYC</title></head><body onload="newWin.print();"></body></html>');
      ;
      // newWin.close();
      // setTimeout(newWin.print ,1000)


      newWin.document.write('<html><head><title>' + 'KYC'  + '</title>');
      newWin.document.write('<s'+'crip'+'t src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js" integrity="sha256-wS9gmOZBqsqWxgIVgA8Y9WcQOa7PgSIX+rPA0VL2rbQ=" crossorigin="anonymous"></scrip'+'t>');

         newWin.document.write('</head><body >');
         // newWin.document.write('<h1>' + document.title  + '</h1>');
         newWin.document.write('<img src="/downloads/kyc/'+src+'" />');
         newWin.document.write('<sc'+'ript type="text/javascript">$(window).load(function() { window.print(); window.close(); });</scr'+'ipt>');



         newWin.document.write('</body></html>');

         newWin.document.close(); // necessary for IE >= 10
         newWin.focus(); // necessary for IE >= 10*/

         // newWin.print();
         // newWin.close();

         return true;



    }


    $scope.requestToApprove = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to approve this user?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, do it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        User.approve({id:id})
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
    $scope.requestToMember = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to demote this member to a normal user?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, do it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;


        User.makeMember({id:id})
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

    $scope.requestToAdmin = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to promote this user to admin privileges?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, do it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        User.makeAdmin({id:id})
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



    $scope.requestToBan = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to ban this user?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, do it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        User.ban({id:id})
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

    $scope.requestToUnBan = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to un-ban this user?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, do it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        User.unban({id:id})
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


    $scope.requestToDelete = function(id)
    {
      SweetAlert.swal({
  			title: "Are you sure?",
  			text: "Are you sure you want to delete this user?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonColor: "#DD6B55",
  			confirmButtonText: "Yes, delete it!",
  			closeOnConfirm: false
  		},  function(e){
        if(!e) return;

        User.delete({id:id})
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

      })
    }




        $scope.requestToRejectKYC = function(id)
        {
          SweetAlert.swal({
      			title: "Are you sure?",
      			text: "Are you sure you want to reject KYC of this user?",
      			type: "warning",
      			showCancelButton: true,
      			confirmButtonColor: "#DD6B55",
      			confirmButtonText: "Yes, delete it!",
      			closeOnConfirm: false
      		},  function(e){
            if(!e) return;

            User.rejectKYC({id:id})
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

          })
        }
  });
