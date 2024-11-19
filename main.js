import {projects} from './projects.js'
import { writeFile } from 'fs/promises';
import { EventEmitter } from 'events';
const filePath = "./projects.js"

const addTask = async (task, projectId) => {

  try {
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    const newTask = {
      id: projects[projectIndex].tasks.length + 1,
      description: task.name,
      status: task.state || "pending",
      deadline: task.deadline,
    };
    
    projects[projectIndex].tasks.push(newTask);
    await writeFile(filePath, `export const projects = ${JSON.stringify(projects, null, 2)};`, 'utf8');

    return { message: "Tarea agregada correctamente" };

  } catch (error) {
    console.error('Error al agregar la tarea:', error);
  }

};

const task = {
  name: "Test",
  deadline: "2024-12-20",
  state: "pending",
};

console.log(await addTask(task,1))

const createSummary = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  const summary = project.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return summary;
};

console.log(createSummary(1));


const orderByDeadline = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  return project.tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

console.log(orderByDeadline(1));


const filterTaskByProject = (projectId, filterFn) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }
  return project.tasks.filter(filterFn);
};

console.log(filterTaskByProject(1, (task) => task.status === "pending"));

const remainingTime = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  const totalDays = project.tasks.reduce((acc, task) => {
    if (task.status === "pending") {
      const remainingDays = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
      return acc + Math.max(0, Math.ceil(remainingDays));
    }
    return acc;
  }, 0);

  return `Dias totales : ${totalDays}`;
};

console.log(remainingTime(1));


const criticalTasks = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  return project.tasks.filter(
    (task) =>
      task.status !== "completed" &&
      (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 3
  );
};

console.log(criticalTasks(1));

const getProject = async (projectId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        resolve(project);
      } else {
        reject('No existe este proyecto');
      }
    }, 1000);
  });
};


(async () => {
  try {
    const projectDetails = await getProject(1);
    console.log(projectDetails);
  } catch (error) {
    console.error(error);
  }
})();

const notificationTask = new EventEmitter();

const updateTasks = async (projectId, taskId, newState) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = projects.findIndex((p) => p.id === projectId);

      if (projectIndex === -1) {
        return reject('No existe este proyecto');
      }

      const taskIndex = projects[projectIndex].tasks.findIndex((t) => t.id === taskId);

      projects[projectIndex].tasks[taskIndex].status = newState;
      resolve('Tarea actualizada con exito');
    }, 1000); 
  });
};

const updateStateEmitter = async (projectId, taskId, newState) => {
  try {
    const result = await updateTasks(projectId, taskId, newState);
    notificationTask.emit('taskcompleted', "Tarea Actualizada con exito");
  } catch (error) {
    notificationTask.emit('errorTask', error);
    throw error;
  }
};

notificationTask.on('taskcompleted', (message) => {
  console.log(`Notification: ${message}`);
});

notificationTask.on('errorTarea', (error) => {
  console.error(`Error: ${error}`);
});

(async () => {
  try {
    await updateStateEmitter(1, 1, 'completed'); 
  } catch (error) {
    console.error(error);
  }
})();