'use strict';

var express = require('express');
var router = express.Router();
var apiController = require('../Controllers/api.js')

var insertEvent = require('../Models/eventModel').insertEvent
var insertPoll = require('../Models/pollModel').insertPoll
var insertEmail = require('../Models/emailModel').insertEmail
var nodeMailer = require('../Workers/email').sendNodeMailer
var insertUser = require('../Models/userModel').insertUser

var request = require('request');
var incrementYesVote = require('../Models/pollModel').incrementYesVote
var incrementNoVote = require('../Models/pollModel').incrementNoVote
var checkVoted = require('../Models/pollModel').checkVoted
var toggleVoted = require('../Models/pollModel').toggleVoted


// ROUTE TO RETRIEVE API(S) DATA 
router.route('/events/:loc/:timeframe')
	.get(function(req, res) {

    var loc = req.params.loc
    var timeframe = req.params.timeframe
    // console.log('loc', loc)
    // console.log('timeframe', timeframe)

		apiController.getEvents(loc, timeframe, function(err, data){
      if(err) {
        res.status(404).send("did not find events")
      } else {
        // console.log('data', data)
        res.json(data)
      }
    });

	});

// ROUTE TO CREATE USERS
router.route('/users')
  .post(function(req,res){
    var user = req.body;

    insertUser(user, function(err, userId){
      if(err){res.send(err)}
        console.log('successful user insert', userId)
      res.json(userId)
    })

    

    //res.json(user)

  })


// ROUTE TO CREATE POLL
//POST BODY must have pollInfo and eventInfo properties, each holding an object with necessary info.
//eventInfo will be preset on client, regardless of API its from. pollInfo will need to have userId,
//user object with will include userId, firstName, lastName.
router.route('/polls')
  .post(function(req, res){
  // create new poll



 
    var pollInfo = req.body.pollInfo;
    var eventInfo = req.body.eventInfo;

    insertEvent(eventInfo, function(err, eventId){
      console.log(eventId)
      if(err){
        res.send(404)
      }
      insertPoll(eventId[0]['id'], pollInfo, function(err, pollId){
        if(err){
          res.send(404)
        }
        for(var i = 0;i<pollInfo.emails.length;i++){
          insertEmail(pollInfo.emails[i], i, pollId[pollId.length-1]['id'], function(err, emailId, i){
            if(err){
              res.send(404)
            }

            var emailObj = {
              to: pollInfo.emails[i],
              user: pollInfo.user.userFirstName + ' '+ pollInfo.user.userLastName,
              eventInfo: eventInfo,
              othersInvited: pollInfo.emails.slice(0,i).concat(pollInfo.emails.slice(i+1))
            }

            request({
              uri: 'http://localhost:4568/jobs',
              headers: {'Content-type': 'application/json'},
              method: 'POST',
              body: JSON.stringify(emailObj)

            })

            if(i === pollInfo.emails.length - 1){

    
              res.send(200, 'ALL EMAILS INSERTED, POLL CREATION SUCCESS')
            }
          })
        }

      })

    })


    // var sendObj = {
    //   userid: userId,
    //   eventObj: eventObj
    // }
    //   res.send(sendObj)


    // add to event table
    // insertEvent(eventObj, function(err, eventId){
    //   // add to poll table
    //   insertPoll(eventId, userId, function(err, pollId){ 
    //   //don't yet know the num of participants because the emais have not been created
    //     if(err){
    //       throw err
    //     }
    //     res.send(pollId)
    //   });
      
    })

    
    
    // add to email table (including main user)
    // send out to email service

 // });

// ROUTE TO CALCULATE POLL STATUS
router.route('/polls/:id')
  .put(function(req, res){
    // updated poll count in poll table
      // if poll complete, send email to everyone
      // or send poll results to everyone as of now

  })

//ROUTE TO INCREMENT YES VOTES FOR A POLL

router.route('/polls/yes/:emailId')
  .put(function(req,res){

    //first check if user has voted
    var emailId = req.params.emailId
    checkVoted(req.params.emailId, function(err, pollObj) {
      if (err) {
        return res.status(404).send("error finding relevant pollId");
      }


      //send back a 409 is the user has already voted
      if (!pollObj[0].voted === false) {
        return res.status(409).send("user has already voted!"); 
      }

      //increment no vote_count for poll in db
      incrementYesVote(pollObj[0].poll_id, function(err, voteCount) {
        if (err) {
          return res.status(404).send("error incrementing yes vote count");
        }
        toggleVoted(emailId, function(err, response) {
          console.log('toggle voted response is', response)
          if (err) {
            return res.status(404).send('error toggling "voted" for email address')
          }
          res.send(voteCount);
        })

      })
    }.bind(this))
    
  }.bind(this));

//ROUTE TO INCREMENT YES VOTES FOR A POLL

router.route('/polls/no/:emailId')
   .put(function(req,res){

    //first check if user has voted
    var emailId = req.params.emailId
    checkVoted(req.params.emailId, function(err, pollObj) {
      if (err) {
        return res.status(404).send("error finding relevant pollId");
      }


      //send back a 409 is the user has already voted
      if (!pollObj[0].voted === false) {
        return res.status(409).send("user has already voted!"); 
      }

      //increment no vote_count for poll in db
      incrementNoVote(pollObj[0].poll_id, function(err, voteCount) {
        if (err) {
          return res.status(404).send("error incrementing yes vote count");
        }
        toggleVoted(emailId, function(err, response) {
          console.log('toggle voted response is', response)
          if (err) {
            return res.status(404).send('error toggling "voted" for email address')
          }
          res.send(voteCount);
        })

      })
    }.bind(this))
    
  }.bind(this));



module.exports = router;
