//this is for our email list
var models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const Email = sequelize.define("Email", {
      email: DataTypes.STRING,
      name: DataTypes.STRING,
    });

    // User.associate = (models) => {
    //   User.belongsToMany(models.Group, {through: models.UserGroup});
    // }

    return Email;
};