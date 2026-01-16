import { Injectable } from '@nestjs/common';
import { Auth, UserAccessDto } from '@servicelabsco/nestjs-utility-services';
import * as useragent from 'express-useragent';
import { UserActivityEntity } from '../entities/user.activity.entity';
import { CommunicationUserEntity } from '../entities/communication.user.entity';

@Injectable()
export class UserActivityService {
  /**
   * Sets the user activity in the database.
   *
   * This method creates a new UserActivityEntity record with the provided user information,
   * activity description, request details, and any additional attributes.
   *
   * @param {Partial<UserAccessDto>} user - The user information, including user ID and authentication attributes.
   * @param {string} activity - A description of the activity being recorded.
   * @param {any} [req] - The HTTP request object, used to extract IP and user agent information.
   * @param {any} [attributes] - Additional attributes to be stored with the activity record.
   * @returns {Promise<UserActivityEntity>} A promise that resolves to the saved UserActivityEntity.
   */
  async set(user: Partial<UserAccessDto>, activity: string, req?: any, attributes?: any) {
    const r = UserActivityEntity.create({ user_id: user.id });

    r.ip = this.getIP(req);
    r.activity_at = new Date();

    r.session_identifier = user?.auth_attributes?.session_identifier || null;
    r.activity = activity;

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        r[key] = value;
      }
    }

    r.user_agent = this.getUserAgent(req);

    return r.save();
  }

  /**
   * Updates the last activity timestamp for a user.
   *
   * This method sets the last_activity_at field of the specified user to the current date and time.
   * If no user ID is provided, it uses the ID of the currently authenticated user.
   *
   * @param {number} [id] - The ID of the user whose last activity is to be updated. If not provided, the current user's ID is used.
   * @returns {Promise<CommunicationUserEntity | undefined>} A promise that resolves to the updated user entity or undefined if the user is not found.
   */
  async setUserLastActivity(id?: number) {
    const userId = id ? id : +Auth.id();

    const user = await CommunicationUserEntity.first(userId);
    if (!user) return;

    user.last_activity_at = new Date();

    return user.save();
  }

  /**
   * Retrieves the IP address from the request object.
   *
   * This method checks the request headers and properties to determine the user's IP address.
   *
   * @param {any} req - The HTTP request object.
   * @returns {string | null} The user's IP address or null if not available.
   */
  private getIP(req: any) {
    if (!req) return null;

    return req.headers['x-forwarded-for'] || req.ip || req.ips[0] || null;
  }

  /**
   * Parses the user agent string from the request headers.
   *
   * This method extracts and returns the user agent information from the request.
   *
   * @param {any} req - The HTTP request object.
   * @returns {object | undefined} An object containing parsed user agent information or undefined if not available.
   */
  private getUserAgent(req: any) {
    const source = req?.headers['user-agent'];
    if (!source) return;

    const data = useragent.parse(source);

    const r = {};
    for (const [key, value] of Object.entries(data)) {
      if (value) r[key] = value;
    }

    return r;
  }
}
