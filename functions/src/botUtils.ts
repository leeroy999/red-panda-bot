import * as admin from 'firebase-admin';
import moment = require('moment');
import {ChatMember, User} from 'telegraf/typings/core/types/typegram';

export const isValidBday = (bday: string): boolean => {
  const re = /^[0-9]{2}[/]{1}[0-9]{2}[/]{1}[0-9]{4}$/g;
  return re.test(bday);
};

export const initialiseMember = async (
    messagerId: number,
    user: User,
    database: admin.database.Database): Promise<void> => {
  const dataFromDb = await database.ref('users/' + messagerId)
      .once('value');
  if (!dataFromDb.exists()) {
    database.ref('users/' + messagerId).set({
      name: `${user.first_name ?? ''} ${user.last_name ?? ''}`,
      username: user.username,
    });
  } else {
    database.ref('users/' + messagerId).update({
      name: `${user.first_name ?? ''} ${user.last_name ?? ''}`,
      username: user.username,
    });
  }
};

export const isMember = (status: ChatMember): boolean => {
  return status.status === 'creator' ||
      status.status === 'administrator' ||
      status.status === 'member' ||
      status.status === 'restricted';
};

export const isSameDayAndMonth = (str1: string, str2: string): boolean => {
  return moment(str1).date() === moment(str2).date() &&
      moment(str1).month() === moment(str2).month();
};

export const getMonth = (m: moment.Moment): string => {
  return m.format('MMMM').toUpperCase();
};

export const getDate = (m: moment.Moment): string => {
  return m.format('DD-MM');
};
