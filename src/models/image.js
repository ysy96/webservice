const Sequelize = require('sequelize');
module.exports = (sequelize,DataTypes)=>{
    const Image = sequelize.define('Image',{
        id:{
            type: DataTypes.UUID,
            primaryKey: true,
            noUpdate: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        file_name:{
            type: DataTypes.STRING,
            noUpdate: true,
            allowNull: false
    
        },
        url:{
            type: DataTypes.STRING,
            allowNull: false,
            noUpdate: true,
        },
        upload_date: {
            allowNull: false,
            noUpdate: true,
            type: DataTypes.DATE
        }
    },{
        freezeTableName: true,
        timestamps: false
    });  

    Image.associate = function(models) {
        Image.belongsTo(models.User,{
            foreignKey: "userId"
        })
    }
    return Image;

}
