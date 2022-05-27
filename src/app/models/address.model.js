

module.exports = (sequelize, Sequelize) => {
    const address = sequelize.define("address", {
     
      addressDir :{
          type: Sequelize.STRING,
          allowNull: false,
          unique: true // no two addressses can be the same
      }
    }, {
      freezeTableName: true,
      tableName: 'address',
      timestamps: false
    });
    return address;
  };
