module.exports = (sequelize, Sequelize) => {
    const pinned = sequelize.define("pinned", {
        contractAddress : {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: false
        },
        tokenId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: false
        }
    }, {
      freezeTableName: true,
      tableName: 'pinned',
      timestamps: false
    });
    return pinned;
  };
