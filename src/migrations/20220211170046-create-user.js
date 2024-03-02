'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User', {
      id:{
        type: Sequelize.UUID,
        primaryKey: true,
        noUpdate: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      first_name:{
          type: Sequelize.STRING,
          allowNull: false

      },
      last_name:{
          type: Sequelize.STRING,
          allowNull: false
      },
      password:{
          type: Sequelize.STRING,
          allowNull: false
      },
      username:{
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
              isEmail:true
          },
          unique: {
              args: true,
              msg: 'Duplicate username!'
          }
      },
      createdAt: {
          allowNull: false,
          noUpdate: true,
          type: Sequelize.DATE
      },
      updatedAt: {
          allowNull: false,
          noUpdate: true,
          type: Sequelize.DATE
      },
    },{
        freezeTableName: true
    });  
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User');
  }
};