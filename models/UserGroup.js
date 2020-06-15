var models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const UserGroup = sequelize.define("UserGroup", {
      blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    });

    UserGroup.associate = (models) => {
        UserGroup.belongsTo(models.User);
        UserGroup.belongsTo(models.Group);
    }

    return UserGroup;
};