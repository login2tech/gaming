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
  // {
  //   key: 'main_heading',
  //   l_1: 'We Always Need A Second Opinion',
  //
  // },
  //
  // {
  //   key: 'hit_4_heading',
  //   l_1: 'I Consult My Results',
  //
  // },
  // {
  //   key: 'hit_4_content',
  //   l_1:
  //     'When the results are available, you will receive an email containing a login code to the site allowing you to consult them confidentially and securely.',
  //   l_2:
  //     'Lorsque les résultats seront disponibles, vous recevrez un email contenant un code de connexion au site vous permettant de les consulter de manière confidentielle et sécurisée.'
  // },
  // {
  //   key: 'pricing_plan_heading',
  //   l_1: 'Pricing Plans',
  //
  // },
  // {
  //   key: 'home_free_heading',
  //   l_1: 'Free',
  //
  // },
  // {
  //   key: 'home_premium_heading',
  //   l_1: 'Premium',
  //
  // },
  // {
  //   key: 'pricing_table_1',
  //   l_1: 'My picture is judged by a panel of 30 people',
  //
  // },
  // {
  //   key: 'pricing_table_1_free',
  //   l_1: '30 People',
  //
  // },
  // {
  //   key: 'pricing_table_1_paid',
  //   l_1: 'Up to 300 People',
  //
  // },
  // {
  //   key: 'pricing_table_2',
  //   l_1: 'I can decide on the age of the panel',
  //
  // },
  // {
  //   key: 'pricing_table_3',
  //   l_1: 'I can decide on the gender composition of my panel',
  //
  // },
  // {
  //   key: 'pricing_table_4',
  //   l_1: 'I can decide on the size of the panel',
  //
  // },
  // {
  //   key: 'pricing_table_5',
  //   l_1: "I have to judge other people's pictures first",
  //
  // },
  // {
  //   key: 'pricing_table_free_btn',
  //   l_1: 'Free Trial Now',
  //
  // },
  // {
  //   key: 'pricing_table_paid_btn',
  //   l_1: 'Order Now',
  //
  // },
  {
    key: '404_heading',
    l_1: '404 - Not Found'
  },
  {
    key: '404_content',
    l_1: 'The page you are looking for doesnt exist'
  },
  // {
  //   key: 'order_email_label',
  //   l_1: 'email',
  //
  // },
  // {
  //   key: 'order_part_of_body_label',
  //   l_1: 'Part of the Body',
  //
  // },
  // {
  //   key: 'order_gener_label',
  //   l_1: 'Gender',
  //
  // },
  // {
  //   key: 'order_age_label',
  //   l_1: 'Age',
  //
  // },
  // {
  //   key: 'dropdown_select',
  //   l_1: 'Select',
  //
  // },

  // {
  //   key: 'order_free_heading',
  //   l_1: 'Free offer',
  //
  // },
  // {
  //   key: 'order_free_text_1',
  //   l_1: 'A faster answer to your question, but less accurate.',
  //
  // },
  // {
  //   key: 'order_free_text_2',
  //   l_1:
  //     'I get the advice of a jury of 10 randomly selected people, regardless of age or sex.',
  //   l_2:
  //     "Je reçois l'avis d'un jury de 10 personnes choisies au hasard, sans distinction d'âge ou de sexe."
  // },
  // {
  //   key: 'order_free_upgrade_text',
  //   l_1: 'Select the premium offer to choose more criteria.',
  //
  // },
  // {
  //   key: 'order_my_selection',
  //   l_1: 'My Selection',
  //
  // },
  // {
  //   key: 'order_confirm',
  //   l_1: 'Confirm my jury',
  //
  // },
  // {
  //   key: 'order_premium_heading',
  //   l_1: 'Premium Offer',
  //
  // },
  // {
  //   key: 'order_premium_text_1',
  //   l_1: 'Ask the opinion of the most concerned.',
  //
  // },
  // {
  //   key: 'order_premium_text_2',
  //   l_1:
  //     'Choose the number and characteristics of the people who will form your jury to obtain the most relevant opinion possible, from people who are asking the same questions as you.',
  //   l_2:
  //     "Choisissez le nombre et les caractéristiques des personnes qui formeront votre jury afin d'obtenir l'opinion la plus pertinente possible, de la part des personnes qui posent les mêmes questions que vous."
  // },
  // {
  //   key: 'order_jury_criteria',
  //   l_1: 'Jury Criteria',
  //
  // },
  // {
  //   key: 'order_jury_count',
  //   l_1: 'Number of jury members',
  //
  // },
  // {
  //   key: 'order_gender_label',
  //   l_1: 'Gender',
  //
  // },
  // {
  //   key: 'order_age_label',
  //   l_1: 'Age',
  //
  // },
  // {
  //   key: 'order_my_selection',
  //   l_1: 'My Selection',
  //
  // },
  // {
  //   key: 'order_confirm',
  //   l_1: 'Confirm my jury',
  //
  // },
  // {
  //   key: 'order_checkout',
  //   l_1: 'Checkout',
  //
  // },
  // {
  //   key: 'order_name_on_card',
  //   l_1: 'Name on Card',
  //
  // },
  // {
  //   key: 'order_card',
  //   l_1: 'Card',
  //
  // },
  // {
  //   key: 'order_success_text',
  //   l_1: 'Your order is well taken into account! We bring together your jury.',
  //
  // },
  // {
  //   key: 'order_success_text_2',
  //   l_1:
  //     'An email will be sent to you as soon as your results are available. Reminder: your secret key is ebf59a450dc09ad95843ac97c77d28d5',
  //   l_2:
  //     'Un email vous sera envoyé dès que vos résultats seront disponibles. Rappel: votre clé secrète est ebf59a450dc09ad95843ac97c77d28d5'
  // },
  // {
  //   key: 'order_dsahboard_link_text',
  //   l_1: 'Dashboard',
  //
  // },
  // {
  //   key: 'order_meanwhile_vote_text',
  //   l_1:
  //     'While waiting for your results, you can answer yourself to the questions of other people!',
  //   l_2:
  //     'En attendant vos résultats, vous pouvez répondre vous-même aux questions des autres!'
  // },
  // {
  //   key: 'order_step_1_heading',
  //   l_1: 'My information',
  //
  // },
  // {
  //   key: 'order_step_1_subheading',
  //   l_1: 'Complete your information',
  //
  // },
  // {
  //   key: 'order_step_2_heading',
  //   l_1: 'My jury',
  //
  // },
  // {
  //   key: 'order_step_2_subheading',
  //   l_1: 'Customize your jury',
  //
  // },
  // {
  //   key: 'order_step_3_heading',
  //   l_1: 'My command',
  //
  // },
  // {
  //   key: 'order_step_3_subheading',
  //   l_1: 'Validate your command',
  //
  // },
  // {
  //   key: 'order_step_4_heading',
  //   l_1: 'My results',
  //
  // },
  // {
  //   key: 'order_step_4_subheading',
  //   l_1: 'Check your results',
  //
  // },
  // {
  //   key: 'vote_make_ur_selection',
  //   l_1: 'Make your Selection',
  //
  // },
  // {
  //   key: 'vote_yes',
  //   l_1: 'Yes',
  //
  // },
  // {
  //   key: 'vote_or',
  //   l_1: 'Or',
  //
  // },
  // {
  //   key: 'vote_no',
  //   l_1: 'No',
  //
  // },
  // {
  //   key: 'vote_submit_next',
  //   l_1: 'Submit and proceed to Next',
  //
  // },
  // {
  //   key: 'vote_allow_mature_content',
  //   l_1: 'Allow mature Content',
  //
  // },
  // {
  //   key: 'vote_is_mature',
  //   l_1: 'Mature',
  //
  // },
  // {
  //   key: 'vote_title',
  //   l_1: 'Vote',
  //
  // },
  // {
  //   key: 'no_more_submissions_to_vote',
  //   l_1: 'No more submissions to vote',
  //
  // },
  // {
  //   key: 'new_submission',
  //   l_1: 'New',
  //
  // },
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
