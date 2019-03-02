const bookshelf = require('../../config/bookshelf');
// var Course = require('../courses/Course');
// var LessonUsage = require('./LessonUsage');

const Course = bookshelf.Model.extend({
  tableName: 'course',
  hasTimestamps: true,
  author: function() {
    return this.belongsTo(User, 'author_id');
  },
  lessons: function() {
    return this.hasMany('Lesson');
  },

  parse: function(response) {
    // console.log('....')
    if (response.image_url == '') {
      response.image_url = '/img/imgs/placeholder.png';
    }

    return response;
  }
  // format: function(response) {
  //   if (response.learnings == '') {
  //     response.learnings = response.learnings.split(`\n`);
  //   }
  //   if (response.requirements == '') {
  //     response.requirements = response.requirements.split(`\n`);
  //   }
  //   return response;
  // }

  // lessons_simple: function () {
  //   return this.hasMany(Lesson)
  // }
});

const Lesson = bookshelf.Model.extend({
  tableName: 'lessons',
  hasTimestamps: true,
  course_details: function() {
    return this.belongsTo(Course, 'course_id');
  },
  parse: function(response) {
    response.quiz_data = response.quiz_data
      ? JSON.parse(response.quiz_data)
      : [];
    return response;
  },
  format: function(response) {
    response.quiz_data = response.quiz_data
      ? JSON.stringify(response.quiz_data)
      : '[]';
    return response;
  }
  // lesson_usage_details: function () {
  //   return this.hasOne(LessonUsage);
  // }
});

module.exports = Lesson;
