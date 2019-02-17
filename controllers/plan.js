const Plan = require('../models/Plan');

exports.deletePlan = function(req, res, next) {
  new Plan({id: req.body.id})
    .destroy()
    .then(function(user) {
      res.send({msg: 'The QA Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the Plan'});
    });
};

exports.updatePlan = function(req, res, next) {
  req.assert('plan_name', 'Title cannot be blank').notEmpty();
  req.assert('cost', 'Cost cannot be blank').notEmpty();
  req.assert('jury_count', 'jury_size cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const plan = new Plan({id: req.body.id});

  plan.save({
    plan_name: req.body.plan_name,
    jury_count: req.body.jury_count,
    cost: req.body.cost
  });

  plan
    .fetch()
    .then(function(plan) {
      res.send({plan: plan, msg: 'Plan has been updated.'});
    })
    .catch(function(err) {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the Plan'});
    });
};

exports.addPlan = function(req, res, next) {
  req.assert('plan_name', 'Title cannot be blank').notEmpty();
  req.assert('cost', 'Cost cannot be blank').notEmpty();
  req.assert('jury_count', 'jury_size cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Plan({
    plan_name: req.body.plan_name,
    jury_count: req.body.jury_count,
    cost: req.body.cost
  })
    .save()
    .then(function(user) {
      res.send({ok: true, msg: 'New Plan has been created successfully.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Plan'});
    });
};

exports.listPlan = function(req, res, next) {
  new Plan()
    .fetchAll()
    .then(function(plans) {
      if (!plans) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, plans: plans.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({ok: false, plans: []});
    });
};

exports.listSinglePlan = function(req, res, next) {
  new Plan()
    .where('id', req.params.id)
    .fetch()
    .then(function(plan) {
      if (!plan) {
        return res.status(200).send({
          ok: false,
          plan: {id: req.params.id, plan_name: '', cost: ''}
        });
      }
      return res.status(200).send({ok: true, plan: plan.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({
        ok: false,
        plan: {
          id: req.params.id,
          plan_name: '',
          cost: '',
          jury_count: ''
        },
        msg: 'failed to fetch from db'
      });
    });
};
