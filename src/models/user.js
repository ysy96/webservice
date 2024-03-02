const Sequelize = require('sequelize');
module.exports = (sequelize,DataTypes)=>{
    const User = sequelize.define('User',{
        id:{
            type: DataTypes.UUID,
            primaryKey: true,
            noUpdate: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        first_name:{
            type: DataTypes.STRING,
            allowNull: false
    
        },
        last_name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail:true
            },
            unique: {
                args: true,
                msg: 'Duplicate username!'
            }
        },
        isVerified:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        createdAt: {
            allowNull: false,
            noUpdate: true,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            noUpdate: true,
            type: DataTypes.DATE
        },
    },{
        freezeTableName: true
    });  

    User.associate = function(models) {
        User.hasOne(models.Image,{
            foreignKey: "userId"
        })
    }
    return User;

    

}
