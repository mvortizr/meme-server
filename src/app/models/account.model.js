

module.exports = (sequelize, Sequelize) => {
  const account = sequelize.define("account", {
    uid: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true

    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    avatarUrl:{
      type: Sequelize.STRING,
      allowNull:false
    },
  }, {
    freezeTableName: true,
    tableName: 'account',
    timestamps: false
  });
  return account;
};