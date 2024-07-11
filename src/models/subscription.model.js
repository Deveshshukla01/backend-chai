import mongoose, {Schema} from "mongoose"

const subsciptionSchema = new schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
        }

},{timestamps: true})

export const subsciption = mongoose.model("subscription", subsciptionSchema)