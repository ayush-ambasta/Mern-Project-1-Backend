const Joi=require("joi");

const validateNewUser=(req)=>{
    const schema= Joi.object({
        name:Joi.string().min(3).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(5).required()
    })
    return schema.validate(req.body);
}

module.exports.validateNewUser=validateNewUser;