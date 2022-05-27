const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  logging: false,
  pool: dbConfig.pool
});

exports.sequelize = sequelize

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.account = require("./account.model.js")(sequelize, Sequelize)
db.address = require("./address.model.js")(sequelize, Sequelize)
db.pinned = require("./pinned.model")(sequelize,Sequelize)
db.profileInfo = require("./profileInfo.model")(sequelize,Sequelize)
db.trade = require("./trade.model")(sequelize,Sequelize)

/*db.exchange = require("./exchange.model.js")(sequelize, Sequelize)
db.key_pair = require("./key_pair.model.js")(sequelize, Sequelize)
db.executor = require("./executor.model.js")(sequelize, Sequelize)

*/
// an account has many key_pairs
db.account.hasMany(db.address, { as: "addresses"});
db.address.belongsTo(db.account, { foreignKeyConstraint: true, foreignKey: { allowNull: false}, as: "account"});

//an account has many pinned
db.account.hasMany(db.pinned, { as: "pinned"});
db.address.hasMany(db.pinned, { as:"pinned" });
db.pinned.belongsTo(db.account, { foreignKeyConstraint: true, foreignKey: { allowNull: false}, as: "account"});
db.pinned.belongsTo(db.address, { foreignKeyConstraint: true, foreignKey: { allowNull: false}, as: "address"});

//an account has profile info
db.account.hasMany(db.profileInfo, { as: "profileInfo"});
db.profileInfo.belongsTo(db.account, { foreignKeyConstraint: true, foreignKey:{allowNull:false}, as:"account"})

// address has many trades, trades belong to an address
db.address.hasMany(db.trade, { as:"tradesCreated", foreignKey:"addressCreated" });
db.address.hasMany(db.trade, { as:"tradesSold", foreignKey:"addressSold" });

db.trade.belongsTo(db.address, { foreignKeyConstraint: true, foreignKey:{name:"addressCreated",allowNull:false}})
db.trade.belongsTo(db.address, { foreignKeyConstraint: true, foreignKey:{name:"addressSold" , allowNull:true}})



module.exports = db;