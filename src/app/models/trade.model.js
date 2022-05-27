const Address = require('./address.model')

module.exports = (sequelize, Sequelize) => {
    const trade = sequelize.define("trade", {
        tradeId: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        royalty: {
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        tokenId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        nftContract: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.fn('now'),
            allowNull: false
        },
        soldDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        cancelledDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        // addressCreated: {
        //     type: Sequelize.STRING,
        //     allowNull:false,
        //     references: {
        //         model: Address,
        //         key: 'id'
        //     }
        // },
        // addressSold: {
        //     type: Sequelize.STRING,
        //     allowNull:false,
        //     references: {
        //         model: Address,
        //         key: 'id'
        //     }
        // }

    }, {
        freezeTableName: true,
        tableName: 'trade',
        timestamps: false
    });
    return trade;
};