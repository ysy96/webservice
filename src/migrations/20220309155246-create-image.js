'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Image', {
      id:{
        type: Sequelize.UUID,
        primaryKey: true,
        noUpdate: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      file_name:{
          type: Sequelize.STRING,
          noUpdate: true,
          allowNull: false
      },
      url:{
          type: Sequelize.STRING,
          allowNull: false,
          noUpdate: true,
      },
      upload_date: {
          allowNull: false,
          noUpdate: true,
          type: Sequelize.DATE
      },
      userId: {
          type: Sequelize.UUID,
          onDelete: "CASCADE",
          references: {
              model: "User",
              key: "id",
              as: "userId",
          }
      },
  },{
      freezeTableName: true,
      timestamps: false
});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Image');
  }
};