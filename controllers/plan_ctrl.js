var Plan = require('../models/plan.js');
var User = require('../models/user.js');

module.exports = {
  show: function(req, res){
    Plan
      .findOne({_id: req.params.id}) // from my_plans view on front end - when user clicks on one of their plans
      .exec(function(err, plan) {
        if (err) return console.log(err)
        res.json({ success: true, message: 'post found', plan: plan });
      })
  },
  index: function(req, res) {
    Plan
      .find({})
      .exec(function(err, plans) {
        if (err) return console.log(err)
        res.json({success: true, message: 'all plans', plans: plans});
      })
  },
  create: function(req, res) {
    User
      .findOne({_id: req.params.id}) // from session/jwt-token/local-storage - refers to current user.
      .exec(function(err, user) {
        if (err) return console.log(err)
        var new_plan = new Plan( req.body ); // form data from create page with events, city, title, etc.
        new_plan.created_by_id = user._id;
        new_plan.save(function(err, plan) {
          if (err) return console.log(err)
          user.created_plans.push( plan );
          user.save(function(err, user) {
            if (err) return console.log(err)
            res.json({success: true, messge: 'plan created', plan: plan})
          })
        })
      })
  },
  // all plans user created but not done
  index_user: function(req, res) {
    User
      .findOne({_id: req.params.id}) // from session/jwt-token/local-storage - refers to current user.
      .exec(function(err, user) {
        if (err) return console.log(err)
        console.log(user._id, '>>> user instance')
        Plan
          .find({created_by_id: user._id}) // finds all plans that the signed in user has created
          .exec(function(err, plans) {
            if (err) return console.log(err)
            res.json({success: true, message: 'all plans created by user', plans: plans});
          })
      })
  },
  // all plans user have completed
  index_rated: function(req, res) {
    
  },
  // plans of others that user wants to follow
  index_bookmark: function(req, res) {

  },

  update_plan_info: function(req, res) {
    // TODO: mvp + optimization when editing
    Plan
      .findOne({_id: req.params.id})
      .exec(function(err, plan) {
        if (err) return console.log(err)
        if (req.body.title) {
          plan.title = req.body.title;
        }
        if (req.body.city) {
          plan.city = req.body.city;
        }
        if (req.body.total_cost) {
          plan.total_cost = req.body.total_cost;
        }
        // removes all sub documents 
        // plan.events.remove({});
        // plan.events.forEach((event) => {
        //   console.log(event._id, '<< eve')
        //   plan.events.id(event._id).remove()
        // })
        for (var i = 0; i < plan.events.length; i++) {
          console.log(plan.events[i]._id, '<< event')
           plan.events.id(plan.events[i]._id).remove()
           
        }
        // console.log(req.body.events, '<<<<<< events<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,')
        // // plan.events.push(req.body.events);
        // req.body.events.forEach((event) => { 
        //   plan.events.push(event) 
        // })
        plan.save(function(err, plan) {
          if (err) return console.log(err)
          res.json({success: true, message: 'plan info updated', plan: plan})
        })
      })
  },
  delete_plan: function(req, res) {
    User
      .findOne({_id: req.params.id}) // from session/jwt-token/local-storage - refers to current user.
      .exec(function(err, user) {
        if (err) return console.log(err)
        user.created_plans.pull({_id: req.body.plan_id}) // removes plan from user's array of plans
        user.save(function(err, user) {
          if (err) return console.log(err)
          Plan
            .findOneAndRemove({_id: req.body.plan_id}, function(err) { // deletes plan instance... mongodb is no-realational so if we just deleted the plan, it would still exist in the user's array of plans.
              if (err) return console.log(err)
              res.json({success: true, message: 'plan successfully deleted'});
            })
        })
      })
  }
}