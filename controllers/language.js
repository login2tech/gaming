const Lang = require('../models/Lang');
const data = [
  {
    key: 'contact_page_heading',
    l_1: 'Contact'
  },
  {
    key: 'contact_page_subject_label',
    l_1: 'Subject'
  },

  {
    key: 'contact_page_email_label',
    l_1: 'Email'
  },
  {
    key: 'contact_page_name_label',
    l_1: 'Name'
  },
  {
    key: 'contact_page_message_label',
    l_1: 'Message'
  },
  {
    key: 'contact_page_send_btn_label',
    l_1: 'Send Now'
  },
  {
    key: 'faq_page_title',
    l_1: 'FAQ'
  },
  {
    key: '404_heading',
    l_1: '404 - Not Found'
  },
  {
    key: '404_content',
    l_1: 'The page you are looking for doesnt exist'
  },
  
  {
    key: 'footer_text_copyright',
    l_1: '&copy; 2019 onlycompgaming'
  }
];

exports.importLang = function(req, res, next) {
  for (let i = 0; i < data.length; i++) {
    new Lang(data[i])
      .save()
      .then(function() {
        // console.log('added');
      })
      .catch(function(err) {});
  }
  res.status(200).send('ok!');
};

exports.listLang = function(req, res, next) {
  new Lang()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};
exports.listSingleLang = function(req, res, next) {
  new Lang()
    .where('id', req.params.id)
    .fetch()
    .then(function(item) {
      if (!item) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', content: ''});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'failed to fetch from db'
      });
    });
};
exports.updateLang = function(req, res, next) {
  req.assert('l_1', 'Language 1 content cannot be blank').notEmpty();
  req.assert('l_2', 'Language 2 content cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const lang = new Lang({id: req.body.id});
  lang
    .save({
      l_1: req.body.l_1
    })
    .then(function(lang) {
      res.send({lang: lang, msg: 'Translation has been updated.'});
    })
    .catch(function(err) {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the translation.'});
    });
};
