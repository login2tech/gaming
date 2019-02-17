/*! angular-trix - v1.0.0 - 2015-12-09
* https://github.com/sachinchoolur/angular-trix
* Copyright (c) 2015 Sachin; Licensed MIT */
!(function() {
  'use strict';
  angular.module('angularTrix', []).directive('angularTrix', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        trixInitialize: '&',
        trixChange: '&',
        trixSelectionChange: '&',
        trixFocus: '&',
        trixBlur: '&',
        trixFileAccept: '&',
        trixAttachmentAdd: '&',
        trixAttachmentRemove: '&'
      },
      link: function(a, b, c, d) {
        b.on('trix-initialize', function() {
          d.$modelValue && b[0].editor.loadHTML(d.$modelValue);
        }),
          (d.$render = function() {
            b[0].editor && b[0].editor.loadHTML(d.$modelValue),
              b.on('trix-change', function() {
                d.$setViewValue(b.html());
              });
          });
        const e = function(d, e) {
          b[0].addEventListener(d, function(f) {
            'trix-file-accept' === d &&
              'true' === c.preventTrixFileAccept &&
              f.preventDefault(),
              a[e]({e: f, editor: b[0].editor});
          });
        };
        e('trix-initialize', 'trixInitialize'),
          e('trix-change', 'trixChange'),
          e('trix-selection-change', 'trixSelectionChange'),
          e('trix-focus', 'trixFocus'),
          e('trix-blur', 'trixBlur'),
          e('trix-file-accept', 'trixFileAccept'),
          e('trix-attachment-add', 'trixAttachmentAdd'),
          e('trix-attachment-remove', 'trixAttachmentRemove');
      }
    };
  });
})();
