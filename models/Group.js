var models = require("./index");

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define("Group", {
    name: DataTypes.STRING,
    pubnubChatID: DataTypes.STRING,
    avatarUrl: DataTypes.TEXT,
    isDirectMessage: { type: DataTypes.BOOLEAN, defaultValue: false },
    groupType: DataTypes.STRING, //
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
    school: DataTypes.STRING,

    professorName: DataTypes.STRING,
    classid: DataTypes.STRING,
    subject: DataTypes.STRING,
    daysOfWeek: DataTypes.STRING,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    section: DataTypes.STRING,
    professorEmail: DataTypes.STRING
  });

  Group.associate = models => {
    Group.belongsToMany(models.User, { through: models.UserGroup });
    Group.hasMany(models.UserGroup);
  };

  return Group;
};
