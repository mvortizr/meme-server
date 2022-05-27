
module.exports = (sequelize, Sequelize) => {
    const profileInfo = sequelize.define("profileInfo", {
      id: {
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          unique: true
      },
      bannerUrl: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      profileDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website:{
        type: Sequelize.STRING,
        allowNull:true
      },
    }, {
      freezeTableName: true,
      tableName: 'profileInfo',
      timestamps: false
    });
    return profileInfo;
  };