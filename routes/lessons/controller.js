const Lesson = require('./Lesson');
const Quiz = require('../../models/Quiz');
const Course = require('./../courses/Course');
// var LessonUsage = require('./LessonUsage');


exports.quizResults = function(req, res, next)
{
  new Quiz()
  .orderBy('created_at', 'DESC')
  .where('lesson_id', req.params.id)
  .fetchAll({
    withRelated: [{'users': function(qb) {
      qb.column('id');
    }}]
  })
  .then(function(items) {
    if (!items) {
      return res.status(200).send([]);
    }
    return res.status(200).send({ok: true, items: items.toJSON()});
  })
  .catch(function(err) {
    console.log(err)
    return res.status(200).send([]);
  });
}

exports.recordUsage = function(req, res, next) {};
exports.list = function(req, res, next) {
  if (!req.params.courseId) {
    return res.status(200).send([]);
  }
  new Lesson()
    .orderBy('order', 'ASC')
    .where('course_id', req.params.courseId)
    .fetchAll()
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      // console.log(err)
      return res.status(200).send([]);
    });
};

exports.single = function(req, res, next) {
  const related = req.query.withRelated ? ['course_details'] : [];
  new Lesson()
    .where('id', req.params.id)
    .fetch({withRelated: related})
    .then(function(lesson) {
      if (!lesson) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', description: ''});
      }
      // if (req.query && req.query.do_add_view && req.query.do_add_view == 'yes') {
      //   Lesson.save({ views: Lesson.get('views') + 1 }).then(function () { }).catch(function (err) { });
      // }
      lesson = lesson.toJSON();
      // lesson.learnings = lesson.learnings ? lesson.learnings.split("\n") : [];
      // lesson.requirements = lesson.requirements ? lesson.requirements.split("\n") : [];

      return res.status(200).send({ok: true, item: lesson});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        description: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.add = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('description', 'Description cannot be blank').notEmpty();
  //req.assert('slug'    , 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  // new Lesson()
  // .where({order: req.body.order})
  // .where({course_id: req.body.course_id})
  // .then()
  // .fetchAllfunction(lsn){
  //   if(lsn)
  //   {
  //     return res.status(400).send({ msg: 'There is an existing lesson with the same number/order. You are using a wrong lesson number.' });
  //     return;
  //   }
  new Lesson({
    title: req.body.title,
    description: req.body.description,
    course_id: req.body.course_id,
    order: req.body.order,
    quiz_data: req.body.quiz_data
  })
    .save()
    .then(function(lesson) {
      res.send({ok: true, msg: 'New Lesson has been created successfully.'});
    })
    .catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        return res.status(400).send({
          msg:
            'There is an existing lesson with the same number/order. You are using a wrong lesson number.'
        });
      }
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Lesson'});
    });
  //
  // })
  // .catch(function(err){
  //   console.log(err)
  //   return res.status(400).send({ msg: 'Something went wrong while created a new Lesson' });
  // });
};

exports.update = function(req, res, next) {
  req.assert('id', 'ID is required').notEmpty();
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('description', 'Content cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  // new Lesson()
  // .where({order: req.body.order})
  // .where({course_id: req.body.course_id})
  // .then().
  // .fetchAll(function(lsn){
  // if(lsn.toJSON().length  && )
  // {
  // return res.status(400).send({ msg: 'There is an existing lesson with the same number/order. You are using a wrong lesson number.' });
  // return;
  // }

  const lesson = new Lesson({id: req.body.id});
  const obj = {
    title: req.body.title,
    description: req.body.description,
    course_id: req.body.course_id,
    quiz_data: req.body.quiz_data,
    order: req.body.order,
    attachment_1: JSON.stringify(req.body.attachment_1)
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  lesson
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({lesson: bll.toJSON(), msg: 'Lesson has been updated.'});
        })
        .catch(function(err) {
          console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the Lesson'});
        });
    })
    .catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        return res.status(400).send({
          msg:
            'There is an existing lesson with the same number/order. You are using a wrong lesson number.'
        });
      }
      console.log(err);
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the Lesson'});
    });
};

exports.delete = function(req, res, next) {
  new Lesson({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The Lesson Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the Lesson'});
    });
};
