import { ipcMain } from 'electron';
import path from 'path';
import { MailInfo } from '../models/mail';
import { loadJSONFile } from '../utils/load-file';
import { writeFileSync } from 'fs';

ipcMain.on('get-list-mail', (event) => {
  const dataFilePath = path.join(path.resolve(), 'Data-JSON/mail-info.json');
  let listMail: MailInfo[] = loadJSONFile(dataFilePath) || [];
  event.reply('get-list-mail', listMail);
});

ipcMain.on('add-multiple-mail', (event, listMailInfo) => {
  const dataFilePath = path.join(path.resolve(), 'Data-JSON/mail-info.json');
  let listMail: MailInfo[] = loadJSONFile(dataFilePath) || [];
  listMail = listMail.concat(listMailInfo);
  writeFileSync(dataFilePath, JSON.stringify(listMail, null, 2));
  event.reply('add-multiple-mail', listMail);
});

ipcMain.on('delete-mail', (event, mailInfo: MailInfo) => {
  const dataFilePath = path.join(path.resolve(), 'Data-JSON/mail-info.json');
  let listMail: MailInfo[] = loadJSONFile(dataFilePath) || [];
  listMail = listMail.filter((mail) => mail.mail !== mailInfo.mail);
  writeFileSync(dataFilePath, JSON.stringify(listMail, null, 2));
  event.reply('delete-mail', listMail);
});