//this records actions such as a user changin a profile pic so that incase they are doing somethign bad, we can track down who did it
var models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const ChangeLog = sequelize.define("ChangeLog", {
      type: DataTypes.STRING,
      user: DataTypes.STRING,
      notes: DataTypes.TEXT
    });

    // User.associate = (models) => {
    //   User.belongsToMany(models.Group, {through: models.UserGroup});
    // }

    return ChangeLog;
};