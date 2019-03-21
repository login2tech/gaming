angular
  .module('MyApp')
  .factory('User', function($http) {
    return {
      list: function() {
        return $http.get('/user/list');
      },
      listSingle: function(id) {
        return $http.get('/user/single/' + id);
      },
      add: function(data) {
        return $http.post('/user/add', data);
      },
      update: function(data) {
        return $http.post('/user/edit', data);
      },
      delete: function(data) {
        return $http.post('/user/delete', data);
      },
      ban: function(data) {
        return $http.post('/user/ban', data);
      },
      unban: function(data) {
        return $http.post('/user/unban', data);
      },
      makeAdmin: function(data) {
        return $http.post('/user/makeAdmin', data);
      },
      makeMember: function(data) {
        return $http.post('/user/makeMember', data);
      }
    };
  })

  .factory('NOTIFS', function($http) {
    return {
      send: function(data) {
        return $http.get('/notifs/list');
      },
      delete: function(data) {
        return $http.post('/notifs/delete', data);
      }
    };
  })

  .factory('Settings', function($http) {
    return {
      list: function() {
        return $http.get('/settings/list');
      },
      listSingle: function(id) {
        return $http.get('/settings/single/' + id);
      },
      update: function(data) {
        return $http.post('/settings/edit', data);
      }
    };
  })
  .factory('Languages', function($http) {
    return {
      list: function() {
        return $http.get('/api/lang/list');
      },
      listSingle: function(id) {
        return $http.get('/api/lang/single/' + id);
      },
      update: function(data) {
        return $http.post('/api/lang/edit', data);
      }
    };
  })
  .factory('FAQ', function($http) {
    return {
      list: function() {
        return $http.get('/api/faq/list');
      },
      listSingle: function(id) {
        return $http.get('/api/faq/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/faq/add', data);
      },
      update: function(data) {
        return $http.post('/api/faq/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/faq/delete', data);
      }
    };
  })
  .factory('PLAN', function($http) {
    return {
      list: function() {
        return $http.get('/api/plan/list');
      },
      listSingle: function(id) {
        return $http.get('/api/plan/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/plan/add', data);
      },
      update: function(data) {
        return $http.post('/api/plan/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/plan/delete', data);
      }
    };
  })
  .factory('CMSPage', function($http) {
    return {
      list: function() {
        return $http.get('/api/cms_pages/list');
      },
      listSingle: function(id) {
        return $http.get('/api/cms_pages/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/cms_pages/add', data);
      },
      update: function(data) {
        return $http.post('/api/cms_pages/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/cms_pages/delete', data);
      }
    };
  })

  .factory('Game', function($http) {
    return {
      list: function() {
        return $http.get('/api/games/list');
      },
      listSingle: function(id) {
        return $http.get('/api/games/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/games/add', data);
      },
      update: function(data) {
        return $http.post('/api/games/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/games/delete', data);
      }
    };
  })
  .factory('Ticket', function($http) {
    return {
      list: function() {
        return $http.get('/api/tickets/list');
      },
      listSingle: function(id) {
        return $http.get('/api/tickets/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/tickets/add', data);
      },
      update: function(data) {
        return $http.post('/api/tickets/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/tickets/delete', data);
      }
    };
  })

  .factory('Tournament', function($http) {
    return {
      list: function() {
        return $http.get('/api/tournaments/list');
      },
      listSingle: function(id) {
        return $http.get('/api/tournaments/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/tournaments/add', data);
      },
      update: function(data) {
        return $http.post('/api/tournaments/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/tournaments/delete', data);
      }
    };
  })

  //
  // .factory('BlogPost', function($http) {
  //   return {
  //     list: function() {
  //       return $http.get('/api/posts/list');
  //     },
  //     listSingle: function(id) {
  //       return $http.get('/api/posts/single/' + id);
  //     },
  //     add: function(data) {
  //       return $http.post('/api/posts/add', data);
  //     },
  //     update: function(data) {
  //       return $http.post('/api/posts/edit', data);
  //     },
  //     delete: function(data) {
  //       return $http.post('/api/posts/delete', data);
  //     }
  //   };
  // })
  // .factory('Category', function($http) {
  //   return {
  //     list: function() {
  //       return $http.get('/api/category/list');
  //     },
  //     listSingle: function(id) {
  //       return $http.get('/api/category/single/' + id);
  //     },
  //     add: function(data) {
  //       return $http.post('/api/category/add', data);
  //     },
  //     update: function(data) {
  //       return $http.post('/api/category/edit', data);
  //     },
  //     delete: function(data) {
  //       return $http.post('/api/category/delete', data);
  //     }
  //   };
  // })
  .factory('Invoice', function($http) {
    return {
      list: function(data) {
        if (data) {
          return $http.get('/api/invoices_of/' + data);
        } else {
          return $http.get('/api/invoices/all');
        }
      }
    };
  })
  .factory('Submissions', function($http) {
    return {
      list: function(data) {
        return $http.get('/api/submissions');
      },
      votes: function(data) {
        return $http.get('/api/submissions/' + data + '/votes');
      },
      ban: function(data) {
        return $http.post('/api/submissions/ban', {id: data});
      }
    };
  })
  .factory('Subject', function($http) {
    return {
      list: function() {
        return $http.get('/api/subject/list');
      },
      listSingle: function(id) {
        return $http.get('/api/subject/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/subject/add', data);
      },
      update: function(data) {
        return $http.post('/api/subject/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/subject/delete', data);
      }
    };
  })
  .factory('Topic', function($http) {
    return {
      list: function() {
        return $http.get('/api/topic/list');
      },
      listSingle: function(id) {
        return $http.get('/api/topic/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/topic/add', data);
      },
      update: function(data) {
        return $http.post('/api/topic/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/topic/delete', data);
      }
    };
  })
  .factory('Course', function($http) {
    return {
      list: function() {
        return $http.get('/api/courses/list');
      },
      listSingle: function(id) {
        return $http.get('/api/courses/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/courses/add', data);
      },
      update: function(data) {
        return $http.post('/api/courses/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/courses/delete', data);
      }
    };
  })
  .factory('Lesson', function($http) {
    return {
      list: function(courseId) {
        return $http.get('/api/ladder/list/' + courseId);
      },
      listSingle: function(id) {
        return $http.get('/api/ladder/single/' + id);
      },
      add: function(data) {
        return $http.post('/api/ladder/add', data);
      },
      update: function(data) {
        return $http.post('/api/ladder/edit', data);
      },
      delete: function(data) {
        return $http.post('/api/ladder/delete', data);
      }
    };
  });
