

module.exports = {
    HOST: process.env.DB_IP, //connect to reckoners ip
    PORT: 5432, //ip is port forwarded from 5432 to 1521
    USER: 'data_entry',
    PASSWORD: process.env.DB_PW,
    DB: process.env.NODE_ENV === 'test'?'test_meme_db':'meme_db',
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};
