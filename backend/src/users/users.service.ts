import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createLocalUser(email: string, passwordHash: string, name?: string) {
    const created = new this.userModel({ email, passwordHash, name });
    return created.save();
  }

  async findOrCreateOAuthUser(
    oauthProvider: string,
    oauthId: string,
    email: string,
    name?: string,
  ) {
    let user = await this.userModel.findOne({ oauthProvider, oauthId }).exec();
    if (!user) {
      user = new this.userModel({ oauthProvider, oauthId, email, name });
      await user.save();
    }
    return user;
  }
}
