var models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      name: DataTypes.STRING, //user can change this
      realName: DataTypes.STRING, //direct from schools, cant change
      schoolName: DataTypes.STRING,
      color: DataTypes.STRING,
      avatarData: DataTypes.TEXT,
      avatarUrl: DataTypes.TEXT,
      major: DataTypes.STRING,
      sqrlNotes: DataTypes.TEXT,
      bio: DataTypes.TEXT,
      accountActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      classList: DataTypes.TEXT, //store classlist as stringified json for now
      accountType: DataTypes.STRING, //student, dean, admin, professor
      password: DataTypes.STRING //used for faculty only at the moment (June 2018)
    });

    User.associate = (models) => {
      User.belongsToMany(models.Group, {through: models.UserGroup});
    }

    return User;
};

