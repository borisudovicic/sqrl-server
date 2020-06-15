var auth = {
  check: function (accountType) {
      return (req, res, next) => {
          if(req.isAuthenticated() && req.user.accountType=='admin'){
              return next(); //admins can be authenticated for users also
          }
          if (req.isAuthenticated() && req.user.accountType == accountType) {
              return next();
          } else if(!accountType && req.isAuthenticated()){
              //authenticate user or admin
              return next();
          }else { //if no one is logged in 
              res.send({status: 'failed', message: 'This page is protected, you are not logged in.'})
          }
      }
  }
}

module.exports = auth;