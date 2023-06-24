import fs from 'fs';
import { randomUUID } from 'node:crypto';
import { parse } from 'csv-parse';
import { dirname } from 'path';
import { Database } from '../database.js';

const __dirname = dirname("src/tasks.csv");
const database = Database.singleton();

export const processFile = async () => {
  const parser = fs
    .createReadStream(`${__dirname}/tasks.csv`)
      .setEncoding('utf8')
      .pipe(parse({ delimiter: ',', from_line: 2 }));

  for await (const record of parser) {
    database.insert('tasks', {
      id: randomUUID(),
      title: record[0],
      description: record[1],
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date()
    })
  }
};