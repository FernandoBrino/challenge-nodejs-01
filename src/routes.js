import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from "./utils/build-route-path.js";
import { filterBodyParams } from './utils/filter-body-params.js';
import { processFile } from './streams/read-csv-stream.js';

const database = Database.singleton();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {   
            const { title, description } = req.query;

            let tasks = database.select('tasks');

            if(title) {
                tasks = database.select('tasks', {title});
            }

            if(description) {
                tasks = database.select('tasks', {description});
            }

            if(title && description) {
                tasks = database.select('tasks', {title});
                tasks = tasks.filter((task) => task.description === description)
            }

            return res.writeHead(200).end(JSON.stringify(tasks))
        }
    },

    {
        method: 'POST',
        path: buildRoutePath('/tasks/create'),
        handler: (req, res) => {
            const bodyFiltered = filterBodyParams(req);

            if(!bodyFiltered.title) {
                return res.writeHead(200).end(JSON.parse({error: "Title should not be empty"}));
            }

            const newTask = {
                id: randomUUID(),
                title: bodyFiltered.title,
                description: bodyFiltered.description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            }

            const createdTask = database.insert('tasks', newTask);

            return res.writeHead(200).end(JSON.stringify(createdTask))
        }
    },

    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            
            const bodyFiltered = filterBodyParams(req);

            const task = database.select('tasks', { 
                id
            });
           
            if(task.length <= 0) {
                return res.writeHead(404).end(JSON.stringify({ error: 'Task not found' }))
            }

            database.update('tasks', id, { ...bodyFiltered})

            return res.writeHead(204).end()
        }
    },

    {
        method: "DELETE",
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select('tasks', { id })

            if(task.length <= 0) {
                return res.writeHead(404).end(JSON.stringify({error: "Task not found"}));
            }

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    },

    {
        method: "PATCH",
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select('tasks', { id })

            console.log(task)

            if(task.length <= 0) {
                return res.writeHead(404).end(JSON.stringify({error: "Task not found"}));
            }

            const updateCompletedAt = task[0].completed_at === null ? true : null;

            database.update('tasks', id, { completed_at: updateCompletedAt})

            return res.writeHead(200).end()
        }
    },

    {
        method: "POST",
        path: buildRoutePath('/tasks/processFile'),
        handler: async (req, res) => {
            await processFile();
            return res.writeHead(204).end()
        }
    }
]