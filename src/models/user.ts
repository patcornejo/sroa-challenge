import validator from 'validator';
import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { RolePretty } from './role';
import { hashPassword } from '../helpers/hash.helper';
import { isDate } from 'validator';

const setPassword = (pass: string) => {
  return hashPassword(pass);
}

const getPassword = (pass: string) => {
  return pass
}

// You User Model definition here
export class User {
  @prop({ required: true, unique: true, validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email'
    }
  })
  email!: string;

  @prop({ required: true, set: setPassword, get: getPassword })
  password!: string;

  @prop({ required: true, unique: false, minlength: 10 })
  name!: string;

  @prop({ required: true, enum: RolePretty })
  role!: string;

  @prop({ validate: {
    validator: validator.isDate,
    message: "Date invalid"
  }})
  dob: Date;

  @prop()
  passwordResetToken: string;

  @prop()
  passwordResetTokenExpires: Date;

  static async getByEmail(this: ReturnModelType<typeof User>, email: string, option: boolean = true) {
    return this.findOne({ email });
  }

  static async add(this: ReturnModelType<typeof User>, new_user:User) {
    return await UserModel.create({ ...new_user });
  }

  static async getUsers(this: ReturnModelType<typeof User>, page: number, limit: number, parsedFilter: {}) {
    return UserModel.find({ ...parsedFilter }).skip(limit * page).limit(limit);
  }

  static async getById(this: ReturnModelType<typeof User>, id: string, lean: boolean = false) {
    return UserModel.findById(id, null, { lean })
  }

  static async updateUser(this: ReturnModelType<typeof User>, id: string, payload: {}) {
    return UserModel.findByIdAndUpdate(id, payload)
  }

  static async deleteById(this: ReturnModelType<typeof User>, id: string) {
    return UserModel.findByIdAndRemove(id)
  }
}

const DefaultTransform = {
  schemaOptions: {
    collection: 'users',
    toJSON: {
      virtuals: true,
      getters: true,
      // versionKey: false,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
  },
};

export const UserModel = getModelForClass(User, DefaultTransform);
