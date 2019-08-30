exports.delete = function(req, res, next)
{
  new req.Mdl({
    id : req.body.id
  }).destroy().then(function(){
    return res.status(200).send({ok:true, msg:'Successfully deleted the item'});
  }).catch
  (function(err){
    // console.log(err);
    if(err.code =  '23503')
    {
    return res.status(400).send({ok:false, msg:'Failed to delete the item. Seems like this item is a parent of some other items.'});  
    }
    return res.status(400).send({ok:false, msg:'Failed to delete the item.'});
  })
}

exports.update = function(req, res, next) {
  new req.Mdl({id: req.body.id})
    .save(req.body.data, {
      method: 'update'
    })
    .then(function() {
      return res.status(200).send({ok: true, msg: 'Update Successful'});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: false, msg: 'failed to perform action'});
    });
};

exports.listPaged = function(req, res, next) {
  let c = new req.Mdl().orderBy('id', 'DESC');

  let p;

  if (req.query.page && parseInt(req.query.page) > 1) {
    p = parseInt(req.query.page);
  } else {
    p = 1;
  }

  const keys = Object.keys(req.query);

  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (key.indexOf('filter_') == 0) {
      if (key == 'filter_team_id_for_match') {
        c = c.query(function(qb) {
          qb.where('team_1_id', req.query.filter_team_id_for_match).orWhere(
            'team_2_id',
            req.query.filter_team_id_for_match
          );
        });
        continue;
      }
      c = c.where({
        [key.replace('filter_', '')]: req.query[key]
      });
    }
  }

  let withRelated = [];
  if (req.query.related) {
    withRelated = req.query.related.split(',');
  }
  let per_page = 3;
  if (req.query.per_page) {
    per_page = req.query.per_page;
  }
  c.fetchPage({page: p, pageSize: per_page, withRelated: withRelated})
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: false, items: [], pagination: {}});
      }
      return res
        .status(200)
        .send({ok: true, items: items.toJSON(), pagination: items.pagination});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: false, items: [], pagination: {}});
    });
};
